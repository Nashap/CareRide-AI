from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from drf_spectacular.utils import extend_schema

from care_ride.supabase_client import get_supabase

from .models import UserProfile, DisabilityCertificate

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UploadCertificateSerializer,
    UserProfileSerializer,
)


# =========================
# REGISTER
# =========================
class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={200: dict},
        summary="Register User"
    )
    def post(self, request):
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

            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })

            if not auth_response.user:
                return Response(
                    {"error": "Supabase signup failed"},
                    status=400
                )

            UserProfile.objects.create(
                auth_user_id=auth_response.user.id,
                name=name,
                email=email,
                role=role
            )

            return Response({
                "message": "User registered successfully",
                "user_id": str(auth_response.user.id),
                "role": role,
                "token": auth_response.session.access_token if auth_response.session else None
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

        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not auth_response.user:
            return Response(
                {"error": "Invalid login credentials"},
                status=401
            )

        if not auth_response.session:
            return Response(
                {"error": "Login failed. Please confirm your email or try again."},
                status=401
            )

        profile = UserProfile.objects.get(email=email)

        return Response({
            "message": "Login successful",
            "token": auth_response.session.access_token,

            # Django Profile ID
            "id": profile.id,

            # Supabase UUID
            "user_id": str(auth_response.user.id),

            "name": profile.name,
            "email": profile.email,
            "role": profile.role,
        })

    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=404
        )

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
@api_view(["GET", "PUT"])
def my_profile(request):

    email = request.query_params.get("email")

    if not email:
        return Response(
            {"error": "Email is required"},
            status=400
        )

    try:
        profile = UserProfile.objects.get(email=email)

    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=404
        )

    if request.method == "GET":

        serializer = UserProfileSerializer(profile)

        return Response(serializer.data)

    serializer = UserProfileSerializer(
        profile,
        data=request.data,
        partial=True
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({
        "message": "Profile updated successfully",
        "profile": serializer.data
    })


# =========================
# UPLOAD CERTIFICATE
# =========================
class UploadCertificateView(APIView):

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=UploadCertificateSerializer,
        responses={200: dict},
        summary="Upload Disability Certificate"
    )
    def post(self, request):

        uploaded_file = request.FILES.get("file")
        email = request.data.get("email")

        if not uploaded_file:
            return Response(
                {"error": "No file uploaded"},
                status=400
            )

        if not email:
            return Response(
                {"error": "Email is required"},
                status=400
            )

        file_path = f"certificates/{uploaded_file.name}"

        try:

            profile = UserProfile.objects.get(email=email)

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

            certificate = DisabilityCertificate.objects.create(
                user=profile,
                file_name=uploaded_file.name,
                file_url=file_url
            )

            return Response({
                "message": "Certificate uploaded successfully",
                "certificate_id": certificate.id,
                "file_url": file_url
            })

        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=404
            )

        except Exception as e:
            return Response(
                {
                    "error": str(e),
                    "step": "upload_certificate"
                },
                status=400
            )