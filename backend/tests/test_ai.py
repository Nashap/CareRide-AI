import os
import pytest
from unittest.mock import patch, MagicMock

# Mock environment variables required by AI services
os.environ["GEMINI_API_KEY"] = "mock-api-key"
os.environ["SUPABASE_URL"] = "http://mock-supabase"
os.environ["SUPABASE_KEY"] = "mock-supabase-key"

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import UserProfile
from rides.models import TravelRequest


@pytest.mark.django_db
@patch("google.generativeai.GenerativeModel.generate_content")
def test_ai_recommendation(
    mock_generate_content
):

    mock_response = MagicMock()
    mock_response.text = '{"recommended_helpers": [], "summary": "Mock recommendation", "model_used": "test-model"}'
    mock_generate_content.return_value = mock_response

    user = User.objects.create_user(
        username="testuser",
        password="password123"
    )

    rider_profile = UserProfile.objects.create(
        name="Test Rider",
        email="testrider@test.com",
        role="rider"
    )

    travel_request = TravelRequest.objects.create(
        rider=rider_profile,
        pickup_location="Pickup A",
        destination="Destination B",
        travel_date="2026-07-02",
        service_type="Hospital visit",
        assistance_type="Wheelchair assistance",
        assistance_level="Medium"
    )

    client = APIClient()

    client.force_authenticate(user=user)

    response = client.post(
        "/api/ai/recommend-helper/",
        {
            "travel_request_id": travel_request.id
        },
        format="json"
    )

    assert response.status_code == 201
    assert response.data["summary"] == "Mock recommendation"