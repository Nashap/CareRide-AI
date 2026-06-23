from rest_framework import serializers
from .models import TravelRequest


class TravelRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = TravelRequest
        fields = "__all__"

    def validate_pickup_location(self, value):

        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Pickup location is too short."
            )

        return value

    def validate_destination(self, value):

        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Destination is too short."
            )

        return value

    def validate(self, data):

        if (
            data.get("pickup_location")
            ==
            data.get("destination")
        ):
            raise serializers.ValidationError(
                "Pickup and destination cannot be the same."
            )

        return data