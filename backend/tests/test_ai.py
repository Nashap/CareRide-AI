import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from django.contrib.auth.models import User


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

    client = APIClient()

    client.force_authenticate(user=user)

    response = client.post(
        "/api/ai/recommend-helper/",
        {
            "travel_request_id":
            "12345678-1234-1234-1234-123456789012"
        },
        format="json"
    )

    assert response.status_code == 201
    assert response.data["summary"] == "Mock recommendation"