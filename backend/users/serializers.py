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
        value = value.strip().lower()
        if UserProfile.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate_email(self, value):
        return value.strip().lower()


class UploadCertificateSerializer(serializers.Serializer):
    file = serializers.FileField()


class UserProfileSerializer(serializers.ModelSerializer):
    profile_completed = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "name",
            "email",
            "role",
            "phone_number",
            "address",
            "date_of_birth",
            "gender",
            "disability_type",
            "medical_notes",
            "emergency_contact_name",
            "emergency_contact_phone",
            "profile_completed",
        ]

        read_only_fields = [
            "email",
            "role",
            "profile_completed",
        ]

    def get_profile_completed(self, obj):
        if not obj.name or not obj.phone_number or not obj.address:
            return False
        if obj.role == "helper":
            try:
                from helpers.models import Helper
                helper = Helper.objects.get(auth_user_id=obj.auth_user_id)
                if not helper.skills:
                    return False
            except:
                return False
        return True


class DisabilityCertificateSerializer(serializers.ModelSerializer):

    class Meta:
        model = DisabilityCertificate
        fields = "__all__"