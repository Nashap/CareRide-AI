from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

from care_ride.supabase_client import get_supabase
from .models import Passenger, DisabilityCertificate
from .serializers import (
    RegisterSerializer,
    LoginSerializer
)


# ----------------------------
# REGISTER
# ----------------------------
@extend_schema(
    request=RegisterSerializer,
    responses={200: dict},
    summary="Register User",
    description="Registers a new user using Supabase Authentication."
)
@api_view(['POST'])
def register(request):
    """
    Registers a new user using Supabase Authentication.
    """

    serializer = RegisterSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        supabase = get_supabase()

        if not supabase:
            return Response(
                {"error": "Supabase not configured"},
                status=500
            )

        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        return Response({
            "message": "User registered successfully",
            "user": str(response.user.id)
        })

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=400
        )


# ----------------------------
# LOGIN
# ----------------------------
@extend_schema(
    request=LoginSerializer,
    responses={200: dict},
    summary="Login User",
    description="Authenticates a user using Supabase Authentication."
)
@api_view(['POST'])
def login(request):
    """
    Authenticates a user using Supabase Authentication.
    """

    serializer = LoginSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        supabase = get_supabase()

        if not supabase:
            return Response(
                {"error": "Supabase not configured"},
                status=500
            )

        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        return Response({
            "message": "Login successful",
            "user": str(response.user.id)
        })

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=400
        )


# ----------------------------
# UPLOAD DISABILITY CERTIFICATE
# ----------------------------
class UploadCertificateView(APIView):
    """
    Uploads disability certificate documents to Supabase Storage.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"error": "No file uploaded"},
                status=400
            )

        file_path = (
            f"certificates/{uploaded_file.name}"
        )

        try:

            supabase = get_supabase()

            if not supabase:
                return Response(
                    {"error": "Supabase not configured"},
                    status=500
                )

            supabase.storage.from_(
                "disability-certificates"
            ).upload(
                file_path,
                uploaded_file.read()
            )

            file_url = (
                supabase.storage
                .from_("disability-certificates")
                .get_public_url(file_path)
            )

            passenger = (
                Passenger.objects.first()
            )

            certificate = (
                DisabilityCertificate.objects.create(
                    passenger=passenger,
                    file_name=uploaded_file.name,
                    file_url=file_url
                )
            )

            return Response({
                "message":
                    "Certificate uploaded successfully",
                "certificate_id":
                    certificate.id,
                "file_url":
                    file_url
            })

        except Exception as e:

            return Response(
                {"error": str(e)},
                status=400
            )