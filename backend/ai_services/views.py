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

    def post(self, request):

        ai_input = request.data

        travel_request_id = ai_input.get("travel_request_id")

        if not travel_request_id:
            return Response(
                {
                    "error": "travel_request_id is required"
                },
                status=400
            )

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