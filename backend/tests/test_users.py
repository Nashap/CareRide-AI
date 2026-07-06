import pytest
import logging
logging.disable(logging.CRITICAL)
from unittest.mock import Mock, patch
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import UserProfile, DisabilityCertificate
from django.contrib.auth.models import User
from datetime import date, timedelta
from helpers.models import Helper

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
    payload = {"name": "New User", "email": "new@test.com", "password": "Password123!", "role": "rider"}
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 200

@pytest.mark.django_db
def test_registration_missing_fields(api_client):
    response = api_client.post("/api/register/", {"email": "test@test.com"}, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_registration_supabase_failure(mock_supabase, api_client):
    mock_supabase.return_value = None
    payload = {"name": "New User", "email": "new@test.com", "password": "Password123!", "role": "rider"}
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 500
    assert "Supabase not configured" in response.data["error"]

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_registration_supabase_signup_failed(mock_supabase, api_client):
    mock_auth_response = Mock()
    mock_auth_response.user = None
    mock_client = Mock()
    mock_client.auth.sign_up.return_value = mock_auth_response
    mock_supabase.return_value = mock_client
    payload = {"name": "New User", "email": "new@test.com", "password": "Password123!", "role": "rider"}
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 400
    assert "Supabase signup failed" in response.data["error"]

@pytest.mark.django_db
@patch("users.views.get_supabase")
@patch("users.views.UserProfile.objects.create")
def test_registration_db_fail(mock_create, mock_supabase, api_client):
    mock_auth_response = Mock()
    mock_auth_response.user.id = "00000000-0000-0000-0000-000000000001"
    mock_client = Mock()
    mock_client.auth.sign_up.return_value = mock_auth_response
    mock_supabase.return_value = mock_client
    mock_create.side_effect = Exception("DB Error")
    payload = {"name": "New User", "email": "new@test.com", "password": "Password123!", "role": "rider"}
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 503

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_registration_generic_exception(mock_supabase, api_client):
    mock_supabase.side_effect = Exception("Generic Error")
    payload = {"name": "New User", "email": "new@test.com", "password": "Password123!", "role": "rider"}
    response = api_client.post("/api/register/", payload, format="json")
    assert response.status_code == 400

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

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_unknown_email(mock_supabase, api_client):
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.side_effect = Exception("Invalid login credentials")
    mock_supabase.return_value = mock_client
    payload = {"email": "unknown@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 404

@pytest.mark.django_db
@patch("users.views.get_supabase")
@patch("users.views.UserProfile.objects.filter")
def test_login_db_unreachable_during_invalid_credentials(mock_filter, mock_supabase, api_client):
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.side_effect = Exception("Invalid login credentials")
    mock_supabase.return_value = mock_client
    mock_filter.side_effect = Exception("DB Timeout")
    payload = {"email": "unknown@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 401
    assert "Database unreachable" in response.data["error"]

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_email_not_confirmed(mock_supabase, api_client):
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.side_effect = Exception("Email not confirmed")
    mock_supabase.return_value = mock_client
    payload = {"email": "test@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 401
    assert "Email is not verified" in response.data["error"]

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_other_auth_exception(mock_supabase, api_client):
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.side_effect = Exception("Some other error")
    mock_supabase.return_value = mock_client
    payload = {"email": "test@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_no_user(mock_supabase, api_client):
    mock_auth_response = Mock()
    mock_auth_response.user = None
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.return_value = mock_auth_response
    mock_supabase.return_value = mock_client
    payload = {"email": "test@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 401

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_no_session(mock_supabase, api_client):
    mock_auth_response = Mock()
    mock_auth_response.user = object()
    mock_auth_response.session = None
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.return_value = mock_auth_response
    mock_supabase.return_value = mock_client
    payload = {"email": "test@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 401

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_success_but_db_fails(mock_supabase, api_client):
    mock_auth_response = Mock()
    mock_auth_response.user = object()
    mock_auth_response.session = object()
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.return_value = mock_auth_response
    mock_supabase.return_value = mock_client
    payload = {"email": "test@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 500

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_no_supabase(mock_supabase, api_client):
    mock_supabase.return_value = None
    payload = {"email": "test@test.com", "password": "Password123"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 500

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_login_generic_exception(mock_supabase, api_client):
    mock_supabase.side_effect = Exception("Generic Login Error")
    payload = {"email": "test@test.com", "password": "Password123!"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_valid_login(mock_supabase, api_client):
    UserProfile.objects.create(email="test@test.com", name="Test", auth_user_id="00000000-0000-0000-0000-000000000002", role="rider")
    mock_auth_response = Mock()
    mock_auth_response.user.id = "00000000-0000-0000-0000-000000000002"
    mock_auth_response.session.access_token = "fake-jwt"
    mock_client = Mock()
    mock_client.auth.sign_in_with_password.return_value = mock_auth_response
    mock_supabase.return_value = mock_client
    payload = {"email": "test@test.com", "password": "Password123!"}
    response = api_client.post("/api/login/", payload, format="json")
    assert response.status_code == 200
    assert response.data["message"] == "Login successful"

# =========================
# PROFILE TESTS
# =========================
@pytest.mark.django_db
def test_get_profile_success(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", role="rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    response = api_client.get("/api/profile/", {"email": "rider@test.com"}, HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    assert response.data["name"] == "Rider"

@pytest.mark.django_db
def test_get_profile_helper_success(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="helper@test.com", name="Helper", role="helper", auth_user_id="00000000-0000-0000-0000-000000000002")
    Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000002", skills="CPR")
    response = api_client.get("/api/profile/", {"email": "helper@test.com"}, HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    assert response.data["skills"] == "CPR"

@pytest.mark.django_db
def test_get_profile_helper_no_helper_model(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="helper@test.com", name="Helper", role="helper", auth_user_id="00000000-0000-0000-0000-000000000002")
    response = api_client.get("/api/profile/", {"email": "helper@test.com"}, HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    assert response.data["skills"] == ""

@pytest.mark.django_db
def test_get_profile_missing_email(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    api_client.force_authenticate(user=user)
    response = api_client.get("/api/profile/", HTTP_ACCEPT="application/json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_get_profile_not_found(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    api_client.force_authenticate(user=user)
    response = api_client.get("/api/profile/", {"email": "none@test.com"}, HTTP_ACCEPT="application/json")
    assert response.status_code == 404

@pytest.mark.django_db
def test_update_profile_invalid_dob_future(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    future_date = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    response = api_client.put("/api/profile/?email=rider@test.com", {"date_of_birth": future_date}, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_update_profile_invalid_dob_underage(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    underage_date = (date.today() - timedelta(days=365*10)).strftime("%Y-%m-%d") # 10 years old
    response = api_client.put("/api/profile/?email=rider@test.com", {"date_of_birth": underage_date}, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_update_profile_invalid_dob_overage(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    overage_date = (date.today() - timedelta(days=365*130)).strftime("%Y-%m-%d")
    response = api_client.put("/api/profile/?email=rider@test.com", {"date_of_birth": overage_date}, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_update_profile_invalid_dob_format(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="rider@test.com", name="Rider", auth_user_id="00000000-0000-0000-0000-000000000002")
    response = api_client.put("/api/profile/?email=rider@test.com", {"date_of_birth": "bad-date"}, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_update_profile_helper_success(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="helper@test.com", name="Helper", role="helper", auth_user_id="00000000-0000-0000-0000-000000000002")
    Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000002", skills="CPR")
    response = api_client.put("/api/profile/?email=helper@test.com", {"skills": "First Aid"}, format="json")
    assert response.status_code == 200
    assert response.data["profile"]["skills"] == "First Aid"

@pytest.mark.django_db
def test_update_profile_helper_no_model(api_client):
    user = User.objects.create_user(username="test", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(email="helper@test.com", name="Helper", role="helper", auth_user_id="00000000-0000-0000-0000-000000000002")
    response = api_client.put("/api/profile/?email=helper@test.com", {"skills": "First Aid"}, format="json")
    assert response.status_code == 200
    assert response.data["profile"]["skills"] == ""

# =========================
# CERTIFICATE TESTS
# =========================
@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_upload_certificate_valid(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    mock_supabase.return_value = Mock()
    uploaded_file = SimpleUploadedFile("cert.pdf", b"fake pdf content", content_type="application/pdf")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 200

@pytest.mark.django_db
def test_upload_certificate_invalid_format(api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    api_client.force_authenticate(user=user)
    uploaded_file = SimpleUploadedFile("cert.txt", b"txt", content_type="text/plain")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 400

@pytest.mark.django_db
def test_upload_certificate_no_file(api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    api_client.force_authenticate(user=user)
    response = api_client.post("/api/upload-certificate/", {}, format="multipart")
    assert response.status_code == 400

@pytest.mark.django_db
def test_upload_certificate_large_file(api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    api_client.force_authenticate(user=user)
    uploaded_file = SimpleUploadedFile("cert.pdf", b"a" * (5 * 1024 * 1024 + 1), content_type="application/pdf")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 400
    assert "File size exceeds" in response.data["error"]

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_upload_certificate_no_supabase(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    mock_supabase.return_value = None
    uploaded_file = SimpleUploadedFile("cert.pdf", b"fake pdf content", content_type="application/pdf")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 500

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_upload_certificate_user_not_found(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    mock_supabase.return_value = Mock()
    uploaded_file = SimpleUploadedFile("cert.pdf", b"fake pdf content", content_type="application/pdf")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 404

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_upload_certificate_upload_fails_but_update_succeeds(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    profile = UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    DisabilityCertificate.objects.create(user=profile, file_name="old.pdf", file_url="old/path.pdf")
    
    mock_client = Mock()
    mock_client.storage.from_().upload.side_effect = Exception("Upload Failed")
    mock_client.storage.from_().update.return_value = True
    mock_supabase.return_value = mock_client

    uploaded_file = SimpleUploadedFile("cert.pdf", b"fake pdf content", content_type="application/pdf")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 200
    cert = DisabilityCertificate.objects.get(user=profile)
    assert cert.file_name == "cert.pdf"

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_upload_certificate_both_upload_and_update_fail(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    
    mock_client = Mock()
    mock_client.storage.from_().upload.side_effect = Exception("Upload Failed")
    mock_client.storage.from_().update.side_effect = Exception("Update Failed")
    mock_supabase.return_value = mock_client

    uploaded_file = SimpleUploadedFile("cert.pdf", b"fake pdf content", content_type="application/pdf")
    response = api_client.post("/api/upload-certificate/", {"file": uploaded_file}, format="multipart")
    assert response.status_code == 400

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_my_certificate_success(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    profile = UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    DisabilityCertificate.objects.create(user=profile, file_name="cert.pdf", file_url="path/cert.pdf")
    
    mock_client = Mock()
    mock_client.storage.from_().create_signed_url.return_value = {"signedURL": "http://signed.url"}
    mock_supabase.return_value = mock_client

    response = api_client.get("/api/profile/certificate/")
    assert response.status_code == 200
    assert response.data["has_certificate"] is True
    assert response.data["url"] == "http://signed.url"

@pytest.mark.django_db
def test_my_certificate_user_not_found(api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    response = api_client.get("/api/profile/certificate/")
    assert response.status_code == 404

@pytest.mark.django_db
def test_my_certificate_no_cert(api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    response = api_client.get("/api/profile/certificate/")
    assert response.status_code == 200
    assert response.data["has_certificate"] is False

@pytest.mark.django_db
@patch("users.views.get_supabase")
def test_my_certificate_supabase_error(mock_supabase, api_client):
    user = User.objects.create_user(username="testuser", password="password123")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    api_client.force_authenticate(user=user)
    profile = UserProfile.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", email="test@test.com", name="Test")
    DisabilityCertificate.objects.create(user=profile, file_name="cert.pdf", file_url="path/cert.pdf")
    
    mock_client = Mock()
    mock_client.storage.from_().create_signed_url.side_effect = Exception("Supabase Error")
    mock_supabase.return_value = mock_client

    response = api_client.get("/api/profile/certificate/")
    assert response.status_code == 500

@pytest.mark.django_db
def test_user_models_str_and_auth():
    profile = UserProfile.objects.create(email="test2@test.com", name="TestUser", role="rider", auth_user_id="00000000-0000-0000-0000-000000000003")
    assert str(profile) == "TestUser (rider)"
    assert profile.is_authenticated is True
    
    cert = DisabilityCertificate.objects.create(user=profile, file_name="cert2.pdf", file_url="path2")
    assert str(cert) == "TestUser - cert2.pdf"

@pytest.mark.django_db
def test_serializer_profile_completed(api_client):
    user = User.objects.create_user(username="test_completion", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000004"
    api_client.force_authenticate(user=user)
    
    # Missing helper model
    UserProfile.objects.create(email="h1@test.com", name="H1", role="helper", auth_user_id="00000000-0000-0000-0000-000000000004", phone_number="123", address="123 St")
    response = api_client.get("/api/profile/?email=h1@test.com")
    assert response.data["profile_completed"] is False
