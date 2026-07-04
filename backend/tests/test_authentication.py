import pytest
from unittest.mock import Mock, patch
from users.authentication import SupabaseAuthentication
from users.models import UserProfile

class MockRequest:
    def __init__(self, path="/api/test/", auth_header=None):
        self.path = path
        self.headers = {}
        if auth_header:
            self.headers["Authorization"] = auth_header

@pytest.fixture
def auth_class():
    return SupabaseAuthentication()

@pytest.mark.django_db
@patch("users.authentication.get_supabase")
def test_valid_jwt(mock_supabase, auth_class):
    UserProfile.objects.create(email="test@test.com", auth_user_id="00000000-0000-0000-0000-000000000001")
    
    mock_client = Mock()
    mock_user_response = Mock()
    mock_user_response.user.id = "00000000-0000-0000-0000-000000000001"
    mock_client.auth.get_user.return_value = mock_user_response
    mock_supabase.return_value = mock_client

    request = MockRequest(auth_header="Bearer valid-token")
    result = auth_class.authenticate(request)
    
    assert result is not None
    assert str(result[0].auth_user_id) == "00000000-0000-0000-0000-000000000001"
    assert result[1] == "valid-token"

def test_missing_jwt(auth_class):
    request = MockRequest()
    result = auth_class.authenticate(request)
    assert result is None

def test_invalid_header_format(auth_class):
    request = MockRequest(auth_header="Basic invalid")
    result = auth_class.authenticate(request)
    assert result is None

def test_null_token(auth_class):
    request = MockRequest(auth_header="Bearer null")
    result = auth_class.authenticate(request)
    assert result is None

@patch("users.authentication.get_supabase")
def test_expired_or_invalid_jwt(mock_supabase, auth_class):
    mock_client = Mock()
    mock_client.auth.get_user.side_effect = Exception("JWT expired")
    mock_supabase.return_value = mock_client

    request = MockRequest(auth_header="Bearer expired-token")
    result = auth_class.authenticate(request)
    assert result is None

@pytest.mark.django_db
@patch("users.authentication.get_supabase")
def test_invalid_user_not_in_db(mock_supabase, auth_class):
    mock_client = Mock()
    mock_user_response = Mock()
    mock_user_response.user.id = "00000000-0000-0000-0000-000000000002"
    mock_client.auth.get_user.return_value = mock_user_response
    mock_supabase.return_value = mock_client

    request = MockRequest(auth_header="Bearer valid-token-but-no-user")
    result = auth_class.authenticate(request)
    assert result is None

def test_public_routes(auth_class):
    request = MockRequest(path="/api/login/", auth_header="Bearer token")
    result = auth_class.authenticate(request)
    assert result is None

def test_authenticate_header(auth_class):
    request = MockRequest()
    header = auth_class.authenticate_header(request)
    assert header == 'Bearer realm="api"'
