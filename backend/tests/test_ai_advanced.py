import os
import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import UserProfile
from rides.models import TravelRequest
from helpers.models import Helper

@pytest.fixture
def base_setup():
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    user.save()
    
    rider = UserProfile.objects.create(name="Rider", email="rider@test.com", role="rider", auth_user_id="00000000-0000-0000-0000-000000000001", phone_number="123", address="Main St")
    tr = TravelRequest.objects.create(
        rider=rider, pickup_location="A", destination="B", travel_date="2026-07-10",
        service_type="Hospital", assistance_type="Wheelchair", assistance_level="High"
    )
    
    helper = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000002", name="H1", skills="Wheelchair", rating=5.0)
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    return client, tr, helper

@pytest.mark.django_db
@patch("google.generativeai.GenerativeModel.generate_content")
def test_recommendation_with_helpers(mock_generate_content, base_setup):
    client, tr, helper = base_setup
    
    mock_response = MagicMock()
    mock_response.text = f'{{"recommended_helpers": [{{"helper_id": {helper.id}, "match_score": 95, "reason": "Good match", "ai_rank": 1}}], "summary": "Found helpers", "model_used": "test"}}'
    mock_generate_content.return_value = mock_response
    
    response = client.post("/api/ai/recommend-helper/", {"travel_request_id": tr.id}, format="json")
    
    assert response.status_code == 201
    assert len(response.data["recommended_helpers"]) == 1
    assert response.data["recommended_helpers"][0]["helper_id"] == helper.id

@pytest.mark.django_db
@patch("google.generativeai.GenerativeModel.generate_content")
def test_recommendation_ai_failure(mock_generate_content, base_setup):
    client, tr, _ = base_setup
    
    mock_generate_content.side_effect = Exception("API limit reached")
    
    response = client.post("/api/ai/recommend-helper/", {"travel_request_id": tr.id}, format="json")
    
    assert response.status_code == 201
    assert "fallback" in response.data["summary"]

@pytest.mark.django_db
def test_recommendation_missing_request(base_setup):
    client, _, _ = base_setup
    response = client.post("/api/ai/recommend-helper/", {}, format="json")
    assert response.status_code == 400

# =========================
# ASSISTANT TESTS
# =========================
@pytest.mark.django_db
@patch("ai_services.views.ai_chat")
def test_ai_chat_view_success(mock_chat, base_setup):
    client, _, _ = base_setup
    
    mock_chat.return_value = {"reply": "Hello there!", "action": "none"}
    
    response = client.post("/api/ai/chat/", {"message": "Hi"}, format="json")
    
    assert response.status_code == 200
    assert response.data["reply"] == "Hello there!"

@pytest.mark.django_db
def test_ai_chat_view_missing_message(base_setup):
    client, _, _ = base_setup
    response = client.post("/api/ai/chat/", {}, format="json")
    assert response.status_code == 400


