from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

from .ai_service import call_ai_recommendation
from .supabase_client import supabase


@extend_schema(
    summary="Generate AI Helper Recommendation",
    description="""
    Uses Gemini AI to analyze a travel request and generate
    ranked helper recommendations.

    The generated recommendations are stored in Supabase.
    """
)
class RecommendHelperView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        ai_input = request.data

        travel_request_id = ai_input.get(
            "travel_request_id"
        )

        if not travel_request_id:
            return Response(
                {
                    "error": "travel_request_id is required"
                },
                status=400
            )

        result = call_ai_recommendation(ai_input)

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