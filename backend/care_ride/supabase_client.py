from supabase import create_client
from django.conf import settings


def get_supabase():
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None

    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )