import pytest
from unittest.mock import Mock, patch
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import UserProfile, DisabilityCertificate
from django.contrib.auth.models import User
from datetime import date, timedelta

@pytest.fixture
def api_client():
    return APIClient()

# =========================
# REGISTRATION TESTS
# =========================
@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_valid_registration(mock_supabase, api_client):
    mock_auth_response = Mock()
    mock_auth_response.user.id = "00000000-0000-0000-0000-000000000001"
    mock_auth_response.session.access_token = "fake-jwt"
    
    mock_client = Mock()
    mock_client.auth.sign_up.return_value = mock_auth_response
    mock_supabase.return_value = mock_client

    payload = {
        "name": "New User",
        "email": "new@test.com",
        "password": "Password123!",
        "role": "rider"
    }
    
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 200
    assert response.data["message"] == "User registered successfully"
    assert UserProfile.objects.filter(email="new@test.com").exists()

@pytest.mark.django_db
def test_registration_missing_fields(api_client):
    payload = {"email": "test@test.com"}
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 400
    assert "name" in response.data
    assert "password" in response.data

@pytest.mark.skip(reason="Django 4.2 test client template bug")
@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_registration_supabase_failure(mock_supabase, api_client):
    mock_supabase.return_value = None
    payload = {
        "name": "New User",
        "email": "new@test.com",
        "password": "Password123!",
        "role": "rider"
    }
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 500
    assert "Supabase not configured" in response.data["error"]

# =========================
# LOGIN TESTS
# =========================
@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_wrong_password(mock_supabase, api_client):
    UserProfile.objects.create(email="test@test.com", name="Test", auth_user_id="00000000-0000-0000-0000-000000000002")
    
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.side_effect = Exception("Invalid login credentials")
    mock_supabase.return_value = mock_client

    payload = {"email": "test@test.com", "password": "WrongPassword"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 401
    assert "Incorrect password" in response.data["error"]

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_unknown_email(mock_supabase, api_client):
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.side_effect = Exception("Invalid login credentials")
    mock_supabase.return_value = mock_client

    payload = {"email": "unknown@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 404
    assert "User not found" in response.data["error"]

@pytest.mark.django_db
def test_login_missing_credentials(api_client):
    response = api_client.post("/api/login/", {}, format="json")
    assert response.status_code == 400

# =========================
# PROFILE TESTS
# =========================
@pytest.mark.skip(reason="Django 4.2 test client template bug")
@pytest.mark.django_db
def test_get_profile_success(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", role="rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    response = api_client.get("/api/my-profile/", {"email": "rider@test.com"}, HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    assert response.data["name"] == "Rider"

@pytest.mark.skip(reason="Django 4.2 test client template bug")
@pytest.mark.django_db
def test_get_profile_missing_email(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    api_client.force_authenticate(user=user)
    response = api_client.get("/api/my-profile/", HTTP_ACCEPT="application/json")
    assert response.status_code == 400
    assert "Email is required" in response.data["error"]

@pytest.mark.skip(reason="Django 4.2 test client template bug")
@pytest.mark.django_db
def test_update_profile_invalid_dob_future(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    future_date = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    response = api_client.put("/api/my-profile/?email=rider@test.com", {"date_of_birth": future_date}, format="json", HTTP_ACCEPT="application/json")
    assert response.status_code == 400
    assert "cannot be today or in the future" in response.data["error"]

@pytest.mark.skip(reason="Django 4.2 test client template bug")
@pytest.mark.django_db
def test_update_profile_invalid_dob_underage(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    underage_date = (date.today() - timedelta(days=365*10)).strftime("%Y-%m-%d") # 10 years old
    response = api_client.put("/api/my-profile/?email=rider@test.com", {"date_of_birth": underage_date}, format="json", HTTP_ACCEPT="application/json")
    assert response.status_code == 400
    assert "at least 18 years old" in response.data["error"]

# =========================
# CERTIFICATE TESTS
# =========================
@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_upload_certificate_valid(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    user.save()
    
    UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    api_client.force_authenticate(user=user)
    
    mock_client = Mock()
    mock_supabase.return_value = mock_client
    
    file_content = b"fake pdf content"
    uploaded_file = SimpleUploadedFile("cert.pdf", file_content, content_type="application/pdf")
    
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 200
    assert response.data["message"] == "Certificate uploaded successfully"
    assert DisabilityCertificate.objects.count() == 1

@pytest.mark.django_db
def test_upload_certificate_invalid_format(api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    api_client.force_authenticate(user=user)
    
    uploaded_file = SimpleUploadedFile("cert.txt", b"txt", content_type="text/plain")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    
    assert response.status_code == 400
    assert "Unsupported file format" in response.data["error"]
