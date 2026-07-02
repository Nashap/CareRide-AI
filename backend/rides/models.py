from django.db import models
from users.models import UserProfile
from helpers.models import Helper


class TravelRequest(models.Model):

    SERVICE_CHOICES = [
        ("Hospital visit", "Hospital visit"),
        ("Govt. office", "Govt. office"),
        ("Shopping", "Shopping"),
        ("School / Work", "School / Work"),
        ("Religious place", "Religious place"),
        ("Other", "Other"),
    ]

    ASSISTANCE_CHOICES = [
        ("Wheelchair assistance", "Wheelchair assistance"),
        ("Walker support", "Walker support"),
        ("Crutches support", "Crutches support"),
        ("Walking assistance", "Walking assistance"),
        ("Travel companion", "Travel companion"),
        ("Hospital visit", "Hospital visit"),
        ("Shopping help", "Shopping help"),
        ("Govt. office help", "Govt. office help"),
        ("Elderly care", "Elderly care"),
        ("Visually impaired", "Visually impaired"),
        ("Hearing impaired", "Hearing impaired"),
        ("Post-surgery", "Post-surgery"),
    ]

    LEVEL_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    rider = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="travel_requests"
    )

    pickup_location = models.CharField(max_length=255)

    destination = models.CharField(max_length=255)

    travel_date = models.DateField()

    travel_time = models.TimeField(null=True, blank=True)

    service_type = models.CharField(
        max_length=100,
        choices=SERVICE_CHOICES
    )

    assistance_type = models.CharField(
        max_length=100,
        choices=ASSISTANCE_CHOICES
    )

    assistance_level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default="Medium"
    )

    additional_note = models.TextField(
        blank=True,
        null=True
    )

    assigned_helper = models.ForeignKey(
        Helper,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_rides"
    )

    status = models.CharField(
        max_length=50,
        default="Pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.rider.name} | {self.pickup_location} → {self.destination}"


class MatchRecommendation(models.Model):

    travel_request = models.ForeignKey(
        TravelRequest,
        on_delete=models.CASCADE,
        related_name="recommendations"
    )

    helper = models.ForeignKey(
        Helper,
        on_delete=models.CASCADE
    )

    recommendation_reason = models.TextField()

    match_score = models.IntegerField(
        null=True,
        blank=True
    )

    ai_summary = models.TextField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    activated_at = models.DateTimeField(
        null=True,
        blank=True
    )

    response_deadline = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.helper.name} → {self.travel_request.id}"


class SOSAlert(models.Model):

    travel_request = models.ForeignKey(
        TravelRequest,
        on_delete=models.CASCADE,
        related_name="sos_alerts"
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"SOS Alert #{self.id}"