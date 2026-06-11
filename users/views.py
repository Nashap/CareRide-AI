from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from care_ride.supabase_client import get_supabase
from .models import Passenger, DisabilityCertificate


# ----------------------------
# REGISTER
# ----------------------------
@api_view(['POST'])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')

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
        return Response({"error": str(e)}, status=400)


# ----------------------------
# LOGIN
# ----------------------------
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

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
        return Response({"error": str(e)}, status=400)


# ----------------------------
# UPLOAD DISABILITY CERTIFICATE
# ----------------------------
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

            # Upload file
            supabase.storage.from_("disability-certificates").upload(
                file_path,
                uploaded_file.read()
            )

            # Get public URL
            file_url = (
                supabase.storage
                .from_("disability-certificates")
                .get_public_url(file_path)
            )

            # Use first passenger for testing
            passenger = Passenger.objects.first()

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
                {"error": str(e)},
                status=400
            )