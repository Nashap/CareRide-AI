from rest_framework import serializers
from .models import UserProfile, DisabilityCertificate


class RegisterSerializer(serializers.Serializer):

    name = serializers.CharField()

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    role = serializers.ChoiceField(
        choices=["rider", "helper"]
    )

    def validate_email(self, value):
        if UserProfile.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )


class UploadCertificateSerializer(serializers.Serializer):
    file = serializers.FileField()


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = [
            "name",
            "email",
            "role",
            "phone_number",
            "date_of_birth",
            "gender",
            "disability_type",
            "medical_notes",
            "emergency_contact_name",
            "emergency_contact_phone",
        ]

        read_only_fields = [
            "email",
            "role",
        ]


class DisabilityCertificateSerializer(serializers.ModelSerializer):

    class Meta:
        model = DisabilityCertificate
        fields = "__all__"