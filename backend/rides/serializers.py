from rest_framework import serializers
from .models import TravelRequest


class TravelRequestSerializer(serializers.ModelSerializer):
    assigned_helper = serializers.SerializerMethodField()
    rider_details = serializers.SerializerMethodField()
    active_helper_ids = serializers.SerializerMethodField()
    my_recommendation = serializers.SerializerMethodField()

    class Meta:
        model = TravelRequest
        fields = "__all__"

    def get_assigned_helper(self, obj):
        if obj.assigned_helper and obj.status in ["AI Recommended", "Waiting for Helper Response", "Searching for another helper", "Assigned", "Completed"]:
            # Grab AI matching context if it exists
            recommendation = obj.recommendations.filter(helper=obj.assigned_helper).first()
            
            helper_data = {
                "id": obj.assigned_helper.id,
                "auth_user_id": str(obj.assigned_helper.auth_user_id),
                "name": obj.assigned_helper.name,
                "skills": obj.assigned_helper.skills,
                "rating": obj.assigned_helper.rating,
                "availability": obj.assigned_helper.availability,
                "match_score": recommendation.match_score if recommendation else None,
                "reason": recommendation.recommendation_reason if recommendation else None,
            }
            
            if obj.status in ["Assigned", "Completed"]:
                from users.models import UserProfile
                try:
                    profile = UserProfile.objects.get(auth_user_id=obj.assigned_helper.auth_user_id)
                    helper_data["phone_number"] = profile.phone_number
                    helper_data["email"] = profile.email
                except UserProfile.DoesNotExist:
                    pass
                    
            return helper_data
        return None
        
    def get_rider_details(self, obj):
        rider = obj.rider
        if rider:
            rider_data = {
                "id": rider.id,
                "name": rider.name,
            }
            if obj.status in ["Assigned", "Completed"]:
                rider_data["phone_number"] = rider.phone_number
                rider_data["email"] = rider.email
            return rider_data
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

    def validate_travel_date(self, value):
        from django.utils import timezone
        
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Travel date and time cannot be in the past."
            )
            
        return value

    def validate(self, data):
        from django.utils import timezone
        from datetime import datetime

        if (
            data.get("pickup_location")
            ==
            data.get("destination")
        ):
            raise serializers.ValidationError(
                "Pickup and destination cannot be the same."
            )
            
        travel_date = data.get("travel_date")
        travel_time = data.get("travel_time")
        
        if travel_date and travel_time:
            ride_datetime = timezone.make_aware(datetime.combine(travel_date, travel_time))
            if ride_datetime < timezone.now():
                raise serializers.ValidationError({
                    "travel_time": "Travel time cannot be in the past for today's date."
                })

        return data

    def get_active_helper_ids(self, obj):
        return list(obj.recommendations.filter(status="Active").values_list("helper_id", flat=True))

    def get_my_recommendation(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        try:
            from helpers.models import Helper
            helper = Helper.objects.get(auth_user_id=request.user.auth_user_id)
        except:
            return None
            
        recommendation = obj.recommendations.filter(helper=helper).first()
        if not recommendation:
            return None
            
        # Calculate Rank
        all_recs = obj.recommendations.order_by('-match_score')
        rank = 1
        for i, rec in enumerate(all_recs):
            if rec.helper_id == helper.id:
                rank = i + 1
                break
                
        return {
            "match_score": recommendation.match_score,
            "reason": recommendation.recommendation_reason,
            "ai_rank": rank,
            "status": recommendation.status
        }