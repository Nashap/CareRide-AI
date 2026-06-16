from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .ai_service import call_ai_recommendation
from .supabase_client import supabase


class RecommendHelperView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        ai_input = request.data

        travel_request_id = request.data.get(
            "travel_request_id"
        )

        if not travel_request_id:
            return Response(
                {"error": "travel_request_id is required"},
                status=400
            )

        result = call_ai_recommendation(ai_input)

        try:
            save_response = supabase.table(
                "ai_recommendations"
            ).insert({
                "travel_request_id": travel_request_id,
                "recommended_helpers": result["recommended_helpers"],
                "ai_summary": result["summary"],
                "model_used": result["model_used"]
            }).execute()

            print("Saved:", save_response)

        except Exception as e:
            print(
                "Supabase Save Error:",
                str(e)
            )

        return Response(result, status=201)