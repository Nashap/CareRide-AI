from rest_framework import serializers
from .models import Helper


class HelperSerializer(serializers.ModelSerializer):

    class Meta:
        model = Helper
        fields = "__all__"

    def validate_name(self, value):

        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Name must contain at least 3 characters."
            )

        return value

    def validate_skills(self, value):

        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Skills description is too short."
            )

        return value

    def validate_rating(self, value):

        if value < 0 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 0 and 5."
            )

        return value