from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample

from .serializers import AIRecommendationSerializer
from .ai_service import call_ai_recommendation
from .assistant import ai_chat

from rides.models import TravelRequest, MatchRecommendation
from helpers.models import Helper
# ======================================================
# AI HELPER RECOMMENDATION
# ======================================================

@extend_schema(
    tags=["AI Recommendations"],
    summary="Generate AI Helper Recommendation",
    description="Uses Gemini AI to analyze a travel request and generate ranked helper recommendations.",
    request=AIRecommendationSerializer,
    responses={
        201: OpenApiResponse(
            description="AI Recommendation Generated Successfully",
            examples=[
                OpenApiExample(
                    'Success',
                    value={
                        "travel_request_id": 10,
                        "recommended_helpers": [
                            {
                                "helper_id": 1,
                                "name": "Alice Smith",
                                "match_score": 95,
                                "reason": "Alice has 5 years of experience with wheelchair assistance."
                            }
                        ],
                        "summary": "AI identified Alice as the best match based on her extensive experience."
                    }
                )
            ]
        ),
        400: OpenApiResponse(description="Bad Request - travel_request_id is required"),
        404: OpenApiResponse(description="Not Found - Travel request not found")
    }
)
@method_decorator(
    ratelimit(
        key="ip",
        rate="10/m",
        method="POST",
        block=True
    ),
    name="post"
)
class RecommendHelperView(APIView):
    """
    Generates AI-powered helper recommendations for travel requests.
    """

    permission_classes = [IsAuthenticated]

    def _populate_helpers(self, recommended_helpers):
        populated_helpers = []
        for rh in recommended_helpers:
            h_id = rh.get("helper_id")
            try:
                helper_obj = Helper.objects.get(id=h_id)
                populated_helpers.append({
                    "helper_id": helper_obj.id,
                    "name": helper_obj.name,
                    "skills": helper_obj.skills,
                    "rating": helper_obj.rating,
                    "availability": helper_obj.availability,
                    "match_score": rh.get("match_score"),
                    "reason": rh.get("reason"),
                })
            except (Helper.DoesNotExist, ValueError):
                pass
        return populated_helpers

    def post(self, request):

        try:
            from users.models import UserProfile
            from users.serializers import UserProfileSerializer
            profile = UserProfile.objects.get(auth_user_id=request.user.auth_user_id)
            prof_serializer = UserProfileSerializer(profile)
            if not prof_serializer.data.get("profile_completed"):
                return Response({"error": "Please complete your profile before booking a ride."}, status=403)
        except:
            pass

        travel_request_id = request.data.get("travel_request_id")

        if not travel_request_id:
            return Response(
                {"error": "travel_request_id is required"},
                status=400
            )

        try:
            travel_request = TravelRequest.objects.get(id=travel_request_id)
        except (TravelRequest.DoesNotExist, ValueError):
            return Response(
                {"error": "Travel request not found"},
                status=404
            )

        helpers = Helper.objects.filter(availability=True).only("id", "name", "skills", "rating", "availability")

        candidates = []

        for helper in helpers:
            candidates.append({
                "helper_id": helper.id,
                "name": helper.name,
                "skills": helper.skills,
                "rating": helper.rating,
                "availability": helper.availability,
            })

        ai_input = {
            "travel_request_id": travel_request.id,
            "travel_request": {
                "pickup_location": travel_request.pickup_location,
                "destination": travel_request.destination,
                "service_type": travel_request.service_type,
                "assistance_type": travel_request.assistance_type,
                "assistance_level": travel_request.assistance_level,
                "additional_note": travel_request.additional_note or "",
            },
            "candidates": candidates,
        }

        try:
            result = call_ai_recommendation(ai_input)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"AI Recommendation failed: {e}")
            result = {}

        # Save AI recommendations to MatchRecommendation
        summary = result.get("summary")
        recommended_helpers_raw = result.get("recommended_helpers", [])
        
        # Fallback if Gemini failed or returned no helpers, but helpers exist
        if not recommended_helpers_raw:
            available_helpers = Helper.objects.filter(availability=True).only("id").order_by('-rating')[:3]
            if available_helpers.exists():
                fallback_scores = [85, 75, 65]
                for i, h in enumerate(available_helpers):
                    recommended_helpers_raw.append({
                        "helper_id": h.id,
                        "reason": "Matched via CareRide fallback engine based on rating and availability.",
                        "match_score": fallback_scores[i] if i < len(fallback_scores) else 50
                    })
                summary = "CareRide fallback engine matched these helpers due to AI service timeout."
                result["summary"] = summary
                result["recommended_helpers"] = recommended_helpers_raw

        # Clear previous non-accepted recommendations just in case AI is re-run
        MatchRecommendation.objects.filter(
            travel_request=travel_request, 
            status__in=["Pending", "Declined", "Expired"]
        ).delete()
        
        helper_dict = {h.id: h for h in helpers}
        for rh in recommended_helpers_raw:
            helper_obj = helper_dict.get(rh.get("helper_id"))
            if helper_obj:
                MatchRecommendation.objects.create(
                    travel_request=travel_request,
                    helper=helper_obj,
                    recommendation_reason=rh.get("reason"),
                    match_score=rh.get("match_score"),
                    ai_summary=summary,
                    status="Pending"
                )

        # Populate recommended helpers with full details
        if "recommended_helpers" in result:
            result["recommended_helpers"] = self._populate_helpers(result["recommended_helpers"])
            
        # Automatically initialize the scheduling engine
        from rides.utils import initialize_recommendations
        initialize_recommendations(travel_request)

        return Response(
            result,
            status=201
        )

class RecommendationDetailView(APIView):
    """
    Fetches the AI recommendation details for a specific travel request.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["AI Recommendations"],
        summary="Get Recommendation Details",
        description="Fetches the AI recommendation details for a specific travel request, including ranked helpers and reasoning.",
        responses={
            200: OpenApiResponse(
                description="Successfully retrieved recommendation details",
                examples=[
                    OpenApiExample(
                        'Details Response',
                        value={
                            "travel_request_id": 10,
                            "recommended_helpers": [
                                {
                                    "helper_id": 1,
                                    "name": "Alice Smith",
                                    "skills": "Wheelchair Assistance, CPR",
                                    "rating": 4.9,
                                    "availability": True,
                                    "match_score": 95,
                                    "reason": "Alice is an exact match for your needs."
                                }
                            ],
                            "summary": "Found 1 highly compatible helper.",
                            "model_used": "gemini-2.5-flash"
                        }
                    )
                ]
            ),
            404: OpenApiResponse(description="No recommendation found for this travel request")
        }
    )
    def get(self, request, travel_request_id):
        # Query native MatchRecommendation objects with select_related to avoid N+1 on helper
        recs = MatchRecommendation.objects.select_related("helper").filter(travel_request_id=travel_request_id)
        
        if not recs.exists():
            return Response(
                {"error": "No recommendation found for this travel request"},
                status=404
            )
            
        summary = recs.first().ai_summary
        populated_helpers = []
        
        for rec in recs:
            populated_helpers.append({
                "helper_id": rec.helper.id,
                "name": rec.helper.name,
                "skills": rec.helper.skills,
                "rating": rec.helper.rating,
                "availability": rec.helper.availability,
                "match_score": rec.match_score,
                "reason": rec.recommendation_reason,
            })
            
        # Sort by match_score descending
        populated_helpers.sort(key=lambda x: x.get("match_score") or 0, reverse=True)

        return Response({
            "travel_request_id": travel_request_id,
            "recommended_helpers": populated_helpers,
            "summary": summary,
            "model_used": "gemini-2.5-flash"
        }, status=200)
# AI ASSISTANT (TOOL USE)
# ======================================================

@extend_schema(
    tags=["AI Assistant"],
    summary="Chat with AI Assistant",
    description="Interact with the CareRide AI Assistant. The assistant can help users navigate the app and provides natural language interactions.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "example": "I need help finding a helper for a medical appointment."
                }
            }
        }
    },
    responses={
        200: OpenApiResponse(
            description="Successfully processed chat message",
            examples=[
                OpenApiExample(
                    'Success',
                    value={
                        "response": "Hello! I am the CareRide AI Assistant. How can I help you book your next ride?"
                    }
                )
            ]
        ),
        400: OpenApiResponse(description="Bad Request - message is required"),
        500: OpenApiResponse(description="Internal Server Error")
    }
)
@api_view(["POST"])
def ai_chat_view(request):
    """
    CareRide AI Assistant.

    Uses database tools when required
    and Gemini for normal conversations.
    """

    message = request.data.get("message")

    if not message:
        return Response(
            {
                "error": "message is required"
            },
            status=400
        )

    try:

        result = ai_chat(message)

        return Response(result)

    except Exception as e:

        return Response(
            {
                "error": str(e)
            },
            status=500
        )
