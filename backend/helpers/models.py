from django.db import models


class Helper(models.Model):
    """
    Stores helper profile information used by the CareRide platform.

    Helpers provide mobility assistance services to passengers.
    The model stores helper details such as name, skills,
    availability status, and rating, which are used by the
    AI recommendation system to match suitable helpers
    with travel requests.
    """

    auth_user_id = models.UUIDField(
        unique=True,
        null=True,
        blank=True
    )

    name = models.CharField(
        max_length=100
    )

    skills = models.TextField()

    rating = models.FloatField(
        default=0
    )

    availability = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.name