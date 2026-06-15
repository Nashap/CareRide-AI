from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .ai_service import call_ai_recommendation


class RecommendHelperView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        ai_input = request.data

        result = call_ai_recommendation(ai_input)

        return Response(result, status=201)