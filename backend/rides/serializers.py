from rest_framework import serializers
from .models import TravelRequest


class TravelRequestSerializer(serializers.ModelSerializer):
    assigned_helper = serializers.SerializerMethodField()

    class Meta:
        model = TravelRequest
        fields = "__all__"

    def get_assigned_helper(self, obj):
        # Retrieve the first MatchRecommendation for this travel request
        # and extract the helper details
        recommendation = obj.recommendations.first()
        if recommendation and obj.status in ["Accepted", "Completed"]:
            return {
                "id": recommendation.helper.id,
                "auth_user_id": str(recommendation.helper.auth_user_id),
                "name": recommendation.helper.name,
                "skills": recommendation.helper.skills,
                "rating": recommendation.helper.rating,
                "availability": recommendation.helper.availability,
            }
        return None

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