from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse

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
        tags=["Authentication"],
        summary="Register a new user",
        description="Creates a new user account in Supabase and the local database. Role can be 'rider' or 'helper'.",
        request=RegisterSerializer,
        responses={
            200: OpenApiResponse(
                description="Successfully registered",
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            "message": "User registered successfully",
                            "user_id": "123e4567-e89b-12d3-a456-426614174000",
                            "role": "rider",
                            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description="Bad Request - Invalid data or signup failed"),
            503: OpenApiResponse(description="Service Unavailable - Supabase registered but local DB failed")
        },
        examples=[
            OpenApiExample(
                'Register Rider',
                value={
                    "name": "John Doe",
                    "email": "john@example.com",
                    "password": "SecurePassword123!",
                    "role": "rider"
                }
            )
        ]
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
    tags=["Authentication"],
    summary="Login user",
    description="Authenticates a user against Supabase. Returns a JWT access token for API authorization.",
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(
            description="Successfully authenticated",
            examples=[
                OpenApiExample(
                    'Success',
                    value={
                        "message": "Login successful",
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "id": 1,
                        "user_id": "123e4567-e89b-12d3-a456-426614174000",
                        "name": "John Doe",
                        "email": "john@example.com",
                        "role": "rider"
                    }
                )
            ]
        ),
        400: OpenApiResponse(description="Bad Request - Validation error"),
        401: OpenApiResponse(description="Unauthorized - Incorrect email/password or email not verified"),
        404: OpenApiResponse(description="Not Found - User does not exist"),
        500: OpenApiResponse(description="Internal Server Error - DB Connection issues")
    },
    examples=[
        OpenApiExample(
            'Login Request',
            value={
                "email": "john@example.com",
                "password": "SecurePassword123!"
            }
        )
    ]
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
@extend_schema(
    tags=["Users"],
    summary="Get or Update Profile",
    description="Retrieves or updates the profile details for the given email.",
    request=UserProfileSerializer,
    responses={
        200: OpenApiResponse(description="Successful operation"),
        400: OpenApiResponse(description="Bad Request"),
        404: OpenApiResponse(description="Profile not found")
    }
)
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

    # DOB Validation
    dob_str = request.data.get("date_of_birth")
    if dob_str:
        from datetime import datetime, date
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
            today = date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            
            if dob >= today:
                return Response({"error": "Date of birth cannot be today or in the future."}, status=400)
            if age < 18:
                return Response({"error": "You must be at least 18 years old."}, status=400)
            if age > 120:
                return Response({"error": "Invalid date of birth. Age exceeds 120 years."}, status=400)
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

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
            helper, created = Helper.objects.get_or_create(
                auth_user_id=profile.auth_user_id,
                defaults={"name": profile.name}
            )
            if "skills" in request.data:
                helper.skills = request.data["skills"]
                helper.name = profile.name # ensure name matches
                helper.save()
            data["skills"] = helper.skills
        except Exception as e:
            print("Helper profile error:", e)
            data["skills"] = ""

    return Response({
        "message": "Profile updated successfully",
        "profile": data
    })

@extend_schema(
    tags=["Users"],
    summary="Get User Certificate",
    description="Retrieves a signed URL for downloading the user's latest uploaded disability certificate.",
    responses={
        200: OpenApiResponse(
            description="Successful retrieval",
            examples=[
                OpenApiExample(
                    'Has Certificate',
                    value={
                        "has_certificate": True,
                        "uploaded_at": "2023-10-10T12:00:00Z",
                        "url": "https://supabase.co/storage/v1/object/signed/disability-certificates/..."
                    }
                ),
                OpenApiExample(
                    'No Certificate',
                    value={
                        "has_certificate": False
                    }
                )
            ]
        ),
        404: OpenApiResponse(description="User not found"),
        500: OpenApiResponse(description="Internal Server Error")
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_certificate(request):
    try:
        profile = UserProfile.objects.get(auth_user_id=request.user.auth_user_id)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    cert = profile.certificates.order_by("-uploaded_at").first()
    if not cert:
        return Response({"has_certificate": False})

    try:
        supabase = get_supabase()
        res = supabase.storage.from_("disability-certificates").create_signed_url(
            cert.file_url, 
            3600,
            options={"download": cert.file_name}
        )
        signed_url = res.get("signedURL") or res.get("signedUrl") if isinstance(res, dict) else res
        
        return Response({
            "has_certificate": True,
            "uploaded_at": cert.uploaded_at,
            "url": signed_url
        })
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error fetching signed URL: {str(e)}")
        return Response({"error": "Failed to retrieve certificate URL"}, status=500)



# =========================
# UPLOAD CERTIFICATE
# =========================
class UploadCertificateView(APIView):

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Users"],
        summary="Upload Disability Certificate",
        description="Allows riders to upload a PDF/JPG/PNG certificate for verification. Maximum size is 5MB.",
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "file": {
                        "type": "string",
                        "format": "binary"
                    }
                }
            }
        },
        responses={
            200: OpenApiResponse(
                description="Successfully uploaded",
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            "message": "Certificate uploaded successfully",
                            "certificate_id": 12,
                            "uploaded_at": "2023-10-10T12:00:00Z"
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description="Bad Request - Missing file, size limit exceeded, or unsupported format"),
            404: OpenApiResponse(description="Not Found - User not found"),
            500: OpenApiResponse(description="Internal Server Error")
        }
    )
    def post(self, request):

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"error": "No file uploaded"},
                status=400
            )

        # 5MB size limit
        if uploaded_file.size > 5 * 1024 * 1024:
            return Response({"error": "File size exceeds 5MB limit"}, status=400)

        allowed_extensions = ["pdf", "jpg", "jpeg", "png"]
        ext = uploaded_file.name.split(".")[-1].lower()
        if ext not in allowed_extensions:
            return Response({"error": "Unsupported file format. Use PDF, JPG, or PNG"}, status=400)

        file_path = f"certificates/{request.user.auth_user_id}_{uploaded_file.name}"

        try:

            profile = UserProfile.objects.get(auth_user_id=request.user.auth_user_id)

            supabase = get_supabase()

            if not supabase:
                return Response(
                    {"error": "Supabase not configured"},
                    status=500
                )

            # Read file once
            file_data = uploaded_file.read()

            try:
                # Try to upload with content-type
                supabase.storage.from_("disability-certificates").upload(
                    file_path,
                    file_data,
                    file_options={"upsert": "true", "content-type": uploaded_file.content_type}
                )
            except Exception as e:
                # Fallback to update if file exists
                try:
                    supabase.storage.from_("disability-certificates").update(
                        file_path,
                        file_data,
                        file_options={"upsert": "true", "content-type": uploaded_file.content_type}
                    )
                except Exception as update_e:
                    import logging
                    logging.getLogger(__name__).error(f"Upload failed: {str(update_e)}")
                    raise

            # Instead of public URL, we just store the file_path
            # The signed URL will be generated on demand.
            # Update existing certificate or create a new one
            certificate = DisabilityCertificate.objects.filter(user=profile).first()
            if certificate:
                certificate.file_name = uploaded_file.name
                certificate.file_url = file_path
                from django.utils import timezone
                certificate.uploaded_at = timezone.now()
                certificate.save()
            else:
                certificate = DisabilityCertificate.objects.create(
                    user=profile,
                    file_name=uploaded_file.name,
                    file_url=file_path
                )

            return Response({
                "message": "Certificate uploaded successfully",
                "certificate_id": certificate.id,
                "uploaded_at": certificate.uploaded_at
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
