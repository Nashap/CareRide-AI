from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from care_ride.supabase_client import get_supabase
from .models import UserProfile

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            supabase = get_supabase()
            if not supabase:
                raise AuthenticationFailed("Supabase is not configured.")

            # Validate the token directly by fetching the user session from Supabase
            user_response = supabase.auth.get_user(token)

            if not user_response or not user_response.user:
                raise AuthenticationFailed("Invalid or expired token.")

            # Map the Supabase UUID to the local Django UserProfile
            profile = UserProfile.objects.get(auth_user_id=user_response.user.id)
            
            return (profile, token)

        except UserProfile.DoesNotExist:
            raise AuthenticationFailed("User profile not found in local database.")
        except Exception as e:
            raise AuthenticationFailed(f"Authentication error: {str(e)}")

    def authenticate_header(self, request):
        return 'Bearer realm="api"'
