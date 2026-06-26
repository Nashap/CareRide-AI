from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

from care_ride.supabase_client import get_supabase

from .models import Passenger, DisabilityCertificate, UserProfile

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UploadCertificateSerializer
)


# =========================
# REGISTER
# =========================
@extend_schema(
    request=RegisterSerializer,
    responses={200: dict},
    summary="Register User"
)
@api_view(["POST"])
def register(request):

    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    name = serializer.validated_data["name"]
    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]
    role = serializer.validated_data["role"]

    try:
        supabase = get_supabase()

        if not supabase:
            return Response(
                {"error": "Supabase not configured"},
                status=500
            )

        # Supabase signup
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        if not auth_response.user:
            return Response(
                {"error": "Supabase signup failed"},
                status=400
            )

        # Create profile in Django DB
        UserProfile.objects.create(
            auth_user_id=auth_response.user.id,
            name=name,
            email=email,
            role=role
        )

        return Response({
            "message": "User registered successfully",
            "user_id": str(auth_response.user.id),
            "role": role
        })

    except Exception as e:
        return Response(
            {
                "error": str(e),
                "step": "register"
            },
            status=400
        )


# =========================
# LOGIN
# =========================
@extend_schema(
    request=LoginSerializer,
    responses={200: dict},
    summary="Login User"
)
@api_view(["POST"])
def login(request):

    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:

        supabase = get_supabase()

        if not supabase:
            return Response(
                {"error": "Supabase not configured"},
                status=500
            )

        # Login with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not auth_response.user:
            return Response(
                {"error": "Invalid login credentials"},
                status=401
            )

        # Get user profile
        try:
            profile = UserProfile.objects.get(email=email)

        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found"},
                status=404
            )

        return Response({
            "message": "Login successful",
            "user_id": str(auth_response.user.id),
            "name": profile.name,
            "email": profile.email,
            "role": profile.role
        })

    except Exception as e:

        return Response(
            {
                "error": str(e),
                "step": "login"
            },
            status=400
        )
# =========================
# PROFILE
# =========================
@api_view(["GET"])
def my_profile(request):

    email = request.query_params.get("email")

    try:
        profile = UserProfile.objects.get(email=email)

        return Response({
            "name": profile.name,
            "email": profile.email,
            "role": profile.role
        })

    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=404
        )


# =========================
# UPLOAD CERTIFICATE
# =========================
class UploadCertificateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"error": "No file uploaded"},
                status=400
            )

        file_path = f"certificates/{uploaded_file.name}"

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

            passenger = Passenger.objects.first()

            if not passenger:
                return Response(
                    {"error": "No passenger found"},
                    status=404
                )

            certificate = DisabilityCertificate.objects.create(
                passenger=passenger,
                file_name=uploaded_file.name,
                file_url=file_url
            )

            return Response({
                "message": "Certificate uploaded successfully",
                "certificate_id": certificate.id,
                "file_url": file_url
            })

        except Exception as e:
            return Response(
                {
                    "error": str(e),
                    "step": "upload_certificate"
                },
                status=400
            )