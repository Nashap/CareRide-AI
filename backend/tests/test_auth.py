import pytest
from unittest.mock import Mock, patch

from rest_framework.test import APIClient


@pytest.mark.django_db
@patch("users.views.UserProfile.objects.get")
@patch("users.views.get_supabase")
def test_login(mock_supabase, mock_profile):

    fake_user = Mock()
    fake_user.id = "123"

    fake_session = Mock()
    fake_session.access_token = "fake-token"

    fake_response = Mock()
    fake_response.user = fake_user
    fake_response.session = fake_session

    mock_client = Mock()
    mock_client.auth.sign_in_with_password.return_value = fake_response

    mock_supabase.return_value = mock_client

    fake_profile = Mock()
    fake_profile.id = 1
    fake_profile.name = "Test User"
    fake_profile.email = "test@test.com"
    fake_profile.role = "rider"

    mock_profile.return_value = fake_profile

    client = APIClient()

    response = client.post(
        "/api/login/",
        {
            "email": "test@test.com",
            "password": "Password123"
        },
        format="json"
    )

    assert response.status_code == 200
    assert response.data["message"] == "Login successful"
    assert response.data["role"] == "rider"
    assert response.data["email"] == "test@test.com"
    assert response.data["name"] == "Test User"