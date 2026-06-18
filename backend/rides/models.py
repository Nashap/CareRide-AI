from django.db import models
from users.models import Passenger
from helpers.models import Helper


class TravelRequest(models.Model):
    """
    Stores travel assistance requests submitted by passengers.

    A travel request contains pickup and destination locations,
    travel date, required assistance type, service category,
    urgency level, and passenger information. These requests
    are used by the AI recommendation system to identify
    suitable helpers.
    """

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

    pickup_location = models.CharField(max_length=255)

    destination = models.CharField(max_length=255)

    travel_date = models.DateField()

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

    passenger = models.ForeignKey(
        Passenger,
        on_delete=models.CASCADE
    )

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.pickup_location} → {self.destination}"


class MatchRecommendation(models.Model):
    """
    Stores helper recommendations generated for a travel request.

    Each record links a travel request with a recommended helper
    and includes the reason for the recommendation.
    """

    travel_request = models.ForeignKey(
        TravelRequest,
        on_delete=models.CASCADE
    )

    helper = models.ForeignKey(
        Helper,
        on_delete=models.CASCADE
    )

    recommendation_reason = models.TextField()

    def __str__(self):
        return (
            f"{self.helper} recommended for "
            f"{self.travel_request}"
        )


class SOSAlert(models.Model):
    """
    Stores emergency SOS alerts raised during a travel request.

    This model records alert messages and timestamps to help
    administrators and helpers respond to emergency situations.
    """

    travel_request = models.ForeignKey(
        TravelRequest,
        on_delete=models.CASCADE
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"SOS Alert for "
            f"{self.travel_request}"
        )