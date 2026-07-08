from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Helper
from .serializers import HelperSerializer


class HelperViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations for helper profiles.

    This ViewSet allows authenticated users to create,
    retrieve, update, and delete helper records. Helper
    information includes skills, availability status,
    and ratings used by the AI recommendation system
    to match helpers with travel requests.
    """

    queryset = Helper.objects.all().order_by('id')
    serializer_class = HelperSerializer
    permission_classes = [IsAuthenticated]
