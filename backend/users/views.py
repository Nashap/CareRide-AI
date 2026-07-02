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
        email = serializer.validated_data["email"].strip().lower()
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

            # Create Django Profile mapping
            try:
                profile = UserProfile.objects.create(
                    auth_user_id=auth_response.user.id,
                    email=email,
                    name=name,
                    role=role
                )
            except Exception as db_err:
                # If the database connection times out, the user is created in Supabase but not in Django.
                # In a real production app, we would use webhooks to sync this. 
                return Response(
                    {"error": "Account created in Supabase, but failed to connect to local database. Please check your DB connection."},
                    status=503
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

    email = serializer.validated_data["email"].strip().lower()
    password = serializer.validated_data["password"]

    try:
        supabase = get_supabase()

        if not supabase:
            return Response(
                {"error": "Supabase not configured."},
                status=500
            )

        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
        except Exception as auth_e:
            error_msg = str(auth_e)
            if "Invalid login credentials" in error_msg:
                # Check if user exists to differentiate between "User not found" and "Incorrect password"
                try:
                    profile = UserProfile.objects.filter(email__iexact=email).first()
                    if profile:
                        return Response({"error": "Incorrect password."}, status=401)
                    else:
                        return Response({"error": "User not found."}, status=404)
                except Exception as db_e:
                    # If database connection times out (IPv6 issues), gracefully fallback
                    return Response({"error": "Invalid login credentials. (Database unreachable)"}, status=401)

            elif "Email not confirmed" in error_msg:
                return Response(
                    {"error": "Email is not verified."},
                    status=401
                )
            else:
                return Response(
                    {"error": f"Authentication failed: {error_msg}"},
                    status=400
                )

        if not auth_response.user:
            return Response(
                {"error": "Invalid login credentials."},
                status=401
            )

        if not auth_response.session:
            return Response(
                {"error": "Login failed. Please confirm your email or try again."},
                status=401
            )

        try:
            profile = UserProfile.objects.get(email__iexact=email)
        except Exception:
            return Response(
                {"error": "Login succeeded via Supabase, but failed to connect to local database. Please check your DB connection."},
                status=500
            )

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
        profile = UserProfile.objects.get(email__iexact=email)

    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=404
        )

    if request.method == "GET":

        serializer = UserProfileSerializer(profile)
        data = serializer.data
        if profile.role == "helper":
            try:
                from helpers.models import Helper
                helper = Helper.objects.get(auth_user_id=profile.auth_user_id)
                data["skills"] = helper.skills
            except:
                data["skills"] = ""

        return Response(data)

    serializer = UserProfileSerializer(
        profile,
        data=request.data,
        partial=True
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    data = serializer.data

    if profile.role == "helper":
        try:
            from helpers.models import Helper
            helper = Helper.objects.get(auth_user_id=profile.auth_user_id)
            if "skills" in request.data:
                helper.skills = request.data["skills"]
                helper.save()
            data["skills"] = helper.skills
        except:
            data["skills"] = ""

    return Response({
        "message": "Profile updated successfully",
        "profile": data
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

            profile = UserProfile.objects.get(email__iexact=email)

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