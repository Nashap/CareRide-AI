import os
import django
import environ

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'care_ride.settings')
django.setup()

from care_ride.supabase_client import get_supabase

supabase = get_supabase()
print("Supabase client initialized:", supabase is not None)

if supabase:
    try:
        # Try signing up a test email
        # We will use a random dummy email to see if it succeeds or what error is returned
        import random
        test_email = f"test_register_{random.randint(1000, 9999)}@example.com"
        print(f"Attempting signup for {test_email}...")
        
        response = supabase.auth.sign_up({
            "email": test_email,
            "password": "Password123!"
        })
        print("Response received:", response)
        print("User:", response.user)
        print("Session:", response.session)
    except Exception as e:
        print("Exception occurred during signup:")
        import traceback
        traceback.print_exc()
else:
    print("Supabase settings not configured properly.")
