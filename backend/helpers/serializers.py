from rest_framework import serializers
from .models import Helper


class HelperSerializer(serializers.ModelSerializer):
    """
    Serializes Helper model data for API requests and responses.

    This serializer converts Helper model instances into JSON
    format and validates incoming helper data for creation
    and update operations.
    """

    class Meta:
        model = Helper
        fields = "__all__"