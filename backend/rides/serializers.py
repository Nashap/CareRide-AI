from rest_framework import serializers
from .models import TravelRequest


class TravelRequestSerializer(serializers.ModelSerializer):
    """
    Serializes TravelRequest model data for API requests
    and responses.

    This serializer converts travel request objects into
    JSON format and validates incoming travel request data
    during create and update operations.
    """

    class Meta:
        model = TravelRequest
        fields = "__all__"