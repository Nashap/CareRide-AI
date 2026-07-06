import os
import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import UserProfile
from rides.models import TravelRequest, MatchRecommendation
from helpers.models import Helper
import json
import logging
from ai_services.assistant import ai_chat, clean_reply

logging.disable(logging.CRITICAL)

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
    
    helper = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000002", name="H1", skills="Wheelchair", rating=5.0, availability=True)
    
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
    client, tr, helper = base_setup
    mock_generate_content.side_effect = Exception("API limit reached")
    
    response = client.post("/api/ai/recommend-helper/", {"travel_request_id": tr.id}, format="json")
    
    assert response.status_code == 201
    assert "fallback" in response.data["summary"]
    assert response.data["recommended_helpers"][0]["helper_id"] == helper.id

@pytest.mark.django_db
def test_recommendation_missing_request(base_setup):
    client, _, _ = base_setup
    response = client.post("/api/ai/recommend-helper/", {}, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_recommendation_invalid_request(base_setup):
    client, _, _ = base_setup
    response = client.post("/api/ai/recommend-helper/", {"travel_request_id": 99999}, format="json")
    assert response.status_code == 404

@pytest.mark.django_db
def test_recommendation_incomplete_profile(base_setup):
    client, tr, _ = base_setup
    profile = UserProfile.objects.get(email="rider@test.com")
    profile.name = "" # Incomplete
    profile.save()
    response = client.post("/api/ai/recommend-helper/", {"travel_request_id": tr.id}, format="json")
    assert response.status_code == 403

@pytest.mark.django_db
@patch("google.generativeai.GenerativeModel.generate_content")
def test_recommendation_populate_error(mock_generate_content, base_setup):
    # Pass an invalid helper ID from the AI
    client, tr, helper = base_setup
    mock_response = MagicMock()
    mock_response.text = f'{{"recommended_helpers": [{{"helper_id": 99999, "match_score": 95, "reason": "Bad ID", "ai_rank": 1}}], "summary": "Found helpers", "model_used": "test"}}'
    mock_generate_content.return_value = mock_response
    
    response = client.post("/api/ai/recommend-helper/", {"travel_request_id": tr.id}, format="json")
    assert response.status_code == 201
    assert len(response.data["recommended_helpers"]) == 0

@pytest.mark.django_db
def test_recommendation_detail_view_success(base_setup):
    client, tr, helper = base_setup
    MatchRecommendation.objects.create(travel_request=tr, helper=helper, match_score=90, recommendation_reason="Test", ai_summary="Summary")
    response = client.get(f"/api/ai/recommendation/{tr.id}/")
    assert response.status_code == 200
    assert response.data["summary"] == "Summary"

@pytest.mark.django_db
def test_recommendation_detail_view_not_found(base_setup):
    client, tr, _ = base_setup
    response = client.get(f"/api/ai/recommendation/{tr.id}/")
    assert response.status_code == 404

# =========================
# ASSISTANT TESTS
# =========================
@pytest.mark.django_db
def test_ai_chat_view_missing_message(base_setup):
    client, _, _ = base_setup
    response = client.post("/api/ai/chat/", {}, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
@patch("ai_services.views.ai_chat")
def test_ai_chat_view_exception(mock_chat, base_setup):
    client, _, _ = base_setup
    mock_chat.side_effect = Exception("Chat Error")
    response = client.post("/api/ai/chat/", {"message": "Hello"}, format="json")
    assert response.status_code == 500

def test_clean_reply():
    assert clean_reply("Hello **bold** and ```code```\r\n\n\n\n     text") == "Hello bold and code text"

@patch("ai_services.assistant.model.generate_content")
def test_ai_chat_router_exception(mock_gen):
    def side_effect(*args, **kwargs):
        if "AI Router" in args[0]:
            raise Exception("Router failure")
        m = MagicMock()
        m.text = "Fallback chat."
        return m
    mock_gen.side_effect = side_effect
    res = ai_chat("Help")
    assert res["tool_used"] is None
    assert res["reply"] == "Fallback chat."

@pytest.mark.django_db
@patch("ai_services.assistant.model.generate_content")
def test_ai_chat_highest_rated(mock_gen, base_setup):
    _, _, helper = base_setup
    def side_effect(*args, **kwargs):
        mock = MagicMock()
        if "AI Router" in args[0]:
            mock.text = '{"tool": "highest_rated_helper"}'
        else:
            mock.text = "Here is the best helper."
        return mock
    mock_gen.side_effect = side_effect
    res = ai_chat("Who is best")
    assert res["tool_used"] == "highest_rated_helper"
    assert res["reply"] == "Here is the best helper."
    assert "tool_result" in res

@pytest.mark.django_db
@patch("ai_services.assistant.model.generate_content")
def test_ai_chat_count(mock_gen, base_setup):
    def side_effect(*args, **kwargs):
        mock = MagicMock()
        if "AI Router" in args[0]:
            mock.text = '{"tool": "count_available_helpers"}'
        else:
            mock.text = "There is 1 helper."
        return mock
    mock_gen.side_effect = side_effect
    res = ai_chat("Count")
    assert res["tool_used"] == "count_available_helpers"

@pytest.mark.django_db
@patch("ai_services.assistant.model.generate_content")
def test_ai_chat_search(mock_gen, base_setup):
    def side_effect(*args, **kwargs):
        mock = MagicMock()
        if "AI Router" in args[0]:
            mock.text = '{"tool": "search_available_helpers", "skill": "Wheelchair"}'
        else:
            mock.text = "Found a helper."
        return mock
    mock_gen.side_effect = side_effect
    res = ai_chat("Find wheelchair")
    assert res["tool_used"] == "search_available_helpers"
    assert res["tool_result"]

@pytest.mark.django_db
@patch("ai_services.assistant.model.generate_content")
def test_ai_chat_none(mock_gen, base_setup):
    def side_effect(*args, **kwargs):
        mock = MagicMock()
        if "AI Router" in args[0]:
            mock.text = '{"tool": "none"}'
        else:
            mock.text = "Just chat."
        return mock
    mock_gen.side_effect = side_effect
    res = ai_chat("Hello")
    assert res["tool_used"] is None

@pytest.mark.django_db
@patch("ai_services.assistant.model.generate_content")
def test_ai_chat_explanation_exception(mock_gen, base_setup):
    def side_effect(*args, **kwargs):
        if "AI Router" in args[0]:
            m = MagicMock()
            m.text = '{"tool": "highest_rated_helper"}'
            return m
        raise Exception("Explanation fail")
    mock_gen.side_effect = side_effect
    res = ai_chat("best")
    assert "Unable to generate AI response. Explanation fail" in res["reply"]

@pytest.mark.django_db
@patch("ai_services.views.call_ai_recommendation")
def test_recommendation_call_ai_exception(mock_call_ai, base_setup):
    client, tr, _ = base_setup
    mock_call_ai.side_effect = Exception("Unknown Exception")
    response = client.post("/api/ai/recommend-helper/", {"travel_request_id": tr.id}, format="json")
    assert response.status_code == 201
    assert "CareRide fallback engine matched these helpers" in response.data["summary"]

@patch("google.generativeai.GenerativeModel.generate_content")
def test_call_ai_recommendation_json_error(mock_gen):
    from ai_services.ai_service import call_ai_recommendation
    mock_response = MagicMock()
    mock_response.text = "invalid json"
    mock_gen.return_value = mock_response
    res = call_ai_recommendation({})
    assert res["summary"] == "Invalid AI response received."

@patch("google.generativeai.GenerativeModel.generate_content")
def test_call_ai_recommendation_429_error(mock_gen):
    from ai_services.ai_service import call_ai_recommendation
    mock_gen.side_effect = Exception("429 Too Many Requests")
    res = call_ai_recommendation({})
    assert res["summary"] == "Rate limit exceeded."

@patch("google.generativeai.GenerativeModel.generate_content")
def test_call_ai_recommendation_token_error(mock_gen):
    from ai_services.ai_service import call_ai_recommendation
    mock_gen.side_effect = Exception("max tokens exceeded")
    res = call_ai_recommendation({})
    assert res["summary"] == "Token limit exceeded."
