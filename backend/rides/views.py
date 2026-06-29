from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import TravelRequest
from .serializers import TravelRequestSerializer


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