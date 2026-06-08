from rest_framework.decorators import api_view
from rest_framework.response import Response
from supabase_client import supabase


@api_view(['POST'])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
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


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
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