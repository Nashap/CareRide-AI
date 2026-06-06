from django.db import models
from users.models import Passenger
from helpers.models import Helper

class TravelRequest(models.Model):
    passenger = models.ForeignKey(Passenger, on_delete=models.CASCADE)
    pickup_location = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    travel_date = models.DateField()
    assistance_type = models.CharField(max_length=100)
    additional_note = models.TextField(blank=True)
    status = models.CharField(max_length=20, default="Pending")

class MatchRecommendation(models.Model):
    travel_request = models.ForeignKey(
        TravelRequest,
        on_delete=models.CASCADE
    )
    helper = models.ForeignKey(
        Helper,
        on_delete=models.CASCADE
    )
    recommendation_reason = models.TextField()

class SOSAlert(models.Model):
    travel_request = models.ForeignKey(
        TravelRequest,
        on_delete=models.CASCADE
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)