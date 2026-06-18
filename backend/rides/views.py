from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import TravelRequest
from .serializers import TravelRequestSerializer


class TravelRequestViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations for travel requests.

    This ViewSet allows authenticated users to create,
    retrieve, update, and delete travel assistance requests.
    It also supports filtering by service type, assistance type,
    assistance level, and request status to simplify request
    management and helper matching.
    """

    queryset = TravelRequest.objects.all()

    serializer_class = TravelRequestSerializer

    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        'service_type',
        'assistance_type',
        'assistance_level',
        'status'
    ]