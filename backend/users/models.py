from django.db import models
import uuid


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("rider", "Rider"),
        ("helper", "Helper"),
    ]

    auth_user_id = models.UUIDField(
        unique=True,
        default=uuid.uuid4
    )

    name = models.CharField(
        max_length=100
    )

    email = models.EmailField(
        unique=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.name} ({self.role})"


class Passenger(models.Model):

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