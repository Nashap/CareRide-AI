from django.db import models
import uuid


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("rider", "Rider"),
        ("helper", "Helper"),
    ]

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
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

    phone_number = models.CharField(
        max_length=15,
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True
    )

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        blank=True
    )

    disability_type = models.CharField(
        max_length=100,
        blank=True
    )

    medical_notes = models.TextField(
        blank=True
    )

    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True
    )

    emergency_contact_phone = models.CharField(
        max_length=15,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.name} ({self.role})"

    @property
    def is_authenticated(self):
        return True


class DisabilityCertificate(models.Model):

    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="certificates"
    )

    file_name = models.CharField(
        max_length=255
    )

    file_url = models.TextField()

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.name} - {self.file_name}"