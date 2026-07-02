from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view

from drf_spectacular.utils import extend_schema

from .serializers import AIRecommendationSerializer
from .ai_service import call_ai_recommendation
from .assistant import ai_chat
from .supabase_client import supabase

from rides.models import TravelRequest
from helpers.models import Helper
# ======================================================
# AI HELPER RECOMMENDATION
# ======================================================

@extend_schema(
    summary="Generate AI Helper Recommendation",
    description="""
    Uses Gemini AI to analyze a travel request and generate
    ranked helper recommendations.

    The generated recommendations are stored in Supabase.
    """,
    request=AIRecommendationSerializer,
    responses={201: dict},
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

    def get(self, request):
        travel_request_id = request.query_params.get("travel_request_id")

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

        try:
            if supabase:
                supabase_response = supabase.table("ai_recommendations")\
                    .select("*")\
                    .eq("travel_request_id", int(travel_request_id))\
                    .execute()
                
                if supabase_response.data:
                    rec = supabase_response.data[0]
                    recommended_helpers = rec.get("recommended_helpers", [])
                    populated_helpers = self._populate_helpers(recommended_helpers)
                    
                    return Response({
                        "travel_request_id": rec.get("travel_request_id"),
                        "recommended_helpers": populated_helpers,
                        "summary": rec.get("ai_summary"),
                        "model_used": rec.get("model_used")
                    }, status=200)

            return Response(
                {"error": "No recommendation found for this travel request"},
                status=404
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )

    def post(self, request):

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

        helpers = Helper.objects.filter(availability=True)

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
            return Response(
                {
                    "error": "AI service unavailable",
                    "details": str(e)
                },
                status=500
            )

        try:

            if supabase:

                save_response = supabase.table(
                    "ai_recommendations"
                ).insert({

                    "travel_request_id": travel_request_id,

                    "recommended_helpers": result.get(
                        "recommended_helpers"
                    ),

                    "ai_summary": result.get(
                        "summary"
                    ),

                    "model_used": result.get(
                        "model_used"
                    )

                }).execute()

                print(
                    "Saved to Supabase:",
                    save_response
                )

            else:

                print(
                    "Supabase not configured. Skipping save."
                )

        except Exception as e:

            print(
                "Supabase Save Error:",
                str(e)
            )

        # Populate recommended helpers with full details
        if "recommended_helpers" in result:
            result["recommended_helpers"] = self._populate_helpers(result["recommended_helpers"])

        return Response(
            result,
            status=201
        )


# ======================================================
# AI ASSISTANT (TOOL USE)
# ======================================================

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