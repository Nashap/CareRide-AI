from rest_framework import serializers
from .models import DisabilityCertificate


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


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )


class UploadCertificateSerializer(
    serializers.Serializer
):
    file = serializers.FileField()


class DisabilityCertificateSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = DisabilityCertificate
        fields = "__all__"

    def validate_file_name(self, value):

        allowed_extensions = (
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png"
        )

        if not value.lower().endswith(
            allowed_extensions
        ):
            raise serializers.ValidationError(
                "Only PDF, JPG, JPEG and PNG files are allowed."
            )

        return value

    def validate_file_url(self, value):

        if not value.startswith(
            ("http://", "https://")
        ):
            raise serializers.ValidationError(
                "Invalid file URL."
            )

        return value