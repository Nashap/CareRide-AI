from django.db import models


class Passenger(models.Model):
    """
    Stores passenger profile information.

    Passengers are users who request travel assistance
    through the CareRide platform. This model contains
    personal information, disability details, and
    emergency contact information required for safe
    travel assistance.
    """

    auth_user_id = models.UUIDField(
        unique=True,
        null=True,
        blank=True
    )

    name = models.CharField(
        max_length=100
    )

    email = models.EmailField(
        unique=True
    )

    disability_type = models.CharField(
        max_length=100
    )

    emergency_contact = models.CharField(
        max_length=15
    )

    def __str__(self):
        return self.name


class DisabilityCertificate(models.Model):
    """
    Stores disability certificate documents uploaded
    by passengers for verification purposes.

    The certificate file information is used to
    validate passenger eligibility for accessibility
    and mobility assistance services.
    """

    passenger = models.ForeignKey(
        Passenger,
        on_delete=models.CASCADE
    )

    file_name = models.CharField(
        max_length=255
    )

    file_url = models.TextField()

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.file_name