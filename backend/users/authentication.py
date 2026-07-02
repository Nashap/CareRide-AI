from rest_framework.authentication import BaseAuthentication
from care_ride.supabase_client import get_supabase
from .models import UserProfile

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Prevent authentication logic from blocking public routes
        path = request.path
        if any(p in path for p in ["/register/", "/login/", "/token/"]):
            return None

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]
        if not token or token in ["null", "undefined"]:
            return None

        try:
            supabase = get_supabase()
            if not supabase:
                return None

            # Validate the token directly by fetching the user session from Supabase
            user_response = supabase.auth.get_user(token)

            if not user_response or not user_response.user:
                return None

            # Map the Supabase UUID to the local Django UserProfile
            profile = UserProfile.objects.get(auth_user_id=user_response.user.id)
            
            return (profile, token)

        except UserProfile.DoesNotExist:
            return None
        except Exception:
            return None

    def authenticate_header(self, request):
        return 'Bearer realm="api"'
