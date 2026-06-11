from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Helper
from .serializers import HelperSerializer


class HelperViewSet(viewsets.ModelViewSet):
    queryset = Helper.objects.all()
    serializer_class = HelperSerializer
    permission_classes = [IsAuthenticated]