from rest_framework import serializers


class RecommendationRequestSerializer(serializers.Serializer):
    """Validates the incoming travel request payload sent to the AI endpoint."""
    id = serializers.IntegerField() 
    disability_type = serializers.CharField()
    pickup_location = serializers.CharField()
    drop_location = serializers.CharField()
    distance_km = serializers.FloatField()
    urgency_level = serializers.ChoiceField(choices=["low", "medium", "high"])
    assistance_required = serializers.CharField()


class RecommendedHelperItemSerializer(serializers.Serializer):
    """Validates a single helper recommendation returned by the AI."""
    helper_id = serializers.CharField()
    match_score = serializers.FloatField(min_value=0, max_value=100)
    reason = serializers.CharField()


class AIRecommendationOutputSerializer(serializers.Serializer):
    """Validates the overall structured AI output before saving to Supabase."""
    recommended_helpers = RecommendedHelperItemSerializer(many=True)
    summary = serializers.CharField()
    model_used = serializers.CharField()