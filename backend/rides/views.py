from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import TravelRequest
from .serializers import TravelRequestSerializer
from helpers.models import Helper


class TravelRequestViewSet(viewsets.ModelViewSet):

    queryset = TravelRequest.objects.select_related(
        "rider"
    ).all()

    serializer_class = TravelRequestSerializer

    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        "service_type",
        "assistance_type",
        "assistance_level",
        "status",
    ]

    @action(detail=True, methods=["post"], url_path="accept-helper")
    def accept_helper(self, request, pk=None):
        travel_request = self.get_object()
        helper_id = request.data.get("helper_id")
        reason = request.data.get("reason", "")

        if not helper_id:
            return Response({"error": "helper_id is required"}, status=400)

        try:
            helper = Helper.objects.get(id=helper_id)
        except Helper.DoesNotExist:
            return Response({"error": "Helper not found"}, status=404)

        travel_request.status = "Accepted"
        travel_request.save()

        from .models import MatchRecommendation
        match, created = MatchRecommendation.objects.update_or_create(
            travel_request=travel_request,
            defaults={
                "helper": helper,
                "recommendation_reason": reason
            }
        )

        return Response({
            "message": "Helper accepted successfully",
            "travel_request_id": travel_request.id,
            "status": travel_request.status,
            "helper_id": helper.id,
            "match_id": match.id
        }, status=200)