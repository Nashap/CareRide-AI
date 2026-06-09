from rest_framework import viewsets
from .models import TravelRequest
from .serializers import TravelRequestSerializer
from rest_framework.permissions import IsAuthenticated

class TravelRequestViewSet(viewsets.ModelViewSet):
    queryset = TravelRequest.objects.all()
    serializer_class = TravelRequestSerializer
    permission_classes = [IsAuthenticated]