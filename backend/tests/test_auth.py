import pytest
from unittest.mock import Mock, patch
from rest_framework.test import APIClient


@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_register(mock_supabase):

    fake_user = Mock()
    fake_user.id = "123"

    fake_response = Mock()
    fake_response.user = fake_user

    mock_client = Mock()
    mock_client.auth.sign_up.return_value = fake_response

    mock_supabase.return_value = mock_client

    client = APIClient()

    response = client.post(
        "/api/register/",
        {
            "email": "test@test.com",
            "password": "Password123"
        },
        format="json"
    )

    assert response.status_code == 200
    assert response.data["message"] == "User registered successfully"


@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login(mock_supabase):

    fake_user = Mock()
    fake_user.id = "123"

    fake_response = Mock()
    fake_response.user = fake_user

    mock_client = Mock()
    mock_client.auth.sign_in_with_password.return_value = fake_response

    mock_supabase.return_value = mock_client

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