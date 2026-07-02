import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import UserProfile
from rides.models import TravelRequest


@pytest.mark.django_db
@patch("ai_services.views.supabase")
@patch("ai_services.views.call_ai_recommendation")
def test_ai_recommendation(
    mock_ai,
    mock_supabase
):

    mock_ai.return_value = {
        "recommended_helpers": [],
        "summary": "Mock recommendation",
        "model_used": "test-model"
    }

    mock_supabase.table.return_value.insert.return_value.execute.return_value = {}

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