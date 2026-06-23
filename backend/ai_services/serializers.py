# ai_services/serializers.py

from rest_framework import serializers

class AIRecommendationSerializer(serializers.Serializer):
    travel_request_id = serializers.IntegerField()