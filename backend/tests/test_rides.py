import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import UserProfile, DisabilityCertificate
from rides.models import TravelRequest, MatchRecommendation
from helpers.models import Helper
from datetime import datetime, date, timedelta
from django.utils import timezone
from unittest.mock import patch, Mock

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def rider_user():
    user = User.objects.create_user(username="rider", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    user.save()
    profile = UserProfile.objects.create(email="rider@test.com", auth_user_id="00000000-0000-0000-0000-000000000001", name="Rider", role="rider")
    # Complete profile
    profile.phone_number = "123"
    profile.address = "123 Main"
    profile.save()
    return user, profile

@pytest.fixture
def helper_user():
    user = User.objects.create_user(username="helper", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    user.save()
    profile = UserProfile.objects.create(email="helper@test.com", auth_user_id="00000000-0000-0000-0000-000000000002", name="Helper", role="helper")
    profile.phone_number = "123"
    profile.address = "123 Main"
    profile.save()
    helper = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000002", name="Helper", skills="Wheelchair")
    return user, profile, helper

# =========================
# TRAVEL REQUEST CRUD
# =========================
@pytest.mark.django_db
def test_create_ride_success(api_client, rider_user):
    user, profile = rider_user
    api_client.force_authenticate(user=user)
    
    payload = {
        "pickup_location": "Hospital A",
        "destination": "Hospital B",
        "travel_date": (date.today() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "travel_time": "10:00",
        "service_type": "Hospital visit",
        "assistance_type": "Wheelchair assistance",
        "assistance_level": "Medium"
    }
    
    response = api_client.post("/api/travel-requests/", payload, format="json")
    assert response.status_code == 201
    assert response.data["destination"] == "Hospital B"

@pytest.mark.django_db
def test_create_ride_incomplete_profile(api_client):
    user = User.objects.create_user(username="rider2", password="pwd")
    user.auth_user_id = "00000000-0000-0000-0000-000000000004"
    user.save()
    UserProfile.objects.create(email="rider2@test.com", auth_user_id="00000000-0000-0000-0000-000000000004", name="Rider", role="rider") # No phone/address
    
    api_client.force_authenticate(user=user)
    
    payload = {
        "pickup_location": "Hospital A",
        "destination": "Hospital B",
        "travel_date": (date.today() + timedelta(days=2)).strftime("%Y-%m-%d"),
    }
    
    response = api_client.post("/api/travel-requests/", payload, format="json")
    assert response.status_code == 403
    assert "complete your profile" in response.data["error"]

# =========================
# ASSIGN & ACCEPT WORKFLOW VIEWS
# =========================
@pytest.mark.django_db
def test_assign_ride(api_client, rider_user, helper_user):
    _, _, helper = helper_user
    user, profile = rider_user
    api_client.force_authenticate(user=user)
    
    tr = TravelRequest.objects.create(
        rider=profile,
        pickup_location="A",
        destination="B",
        travel_date=(date.today() + timedelta(days=2))
    )
    
    payload = {"helper_id": helper.id}
    response = api_client.patch(f"/api/travel-requests/{tr.id}/assign/", payload, format="json")
    
    assert response.status_code == 200
    tr.refresh_from_db()
    assert tr.assigned_helper == helper
    assert tr.status == "Waiting for Helper Response"

@pytest.mark.django_db
def test_accept_ride(api_client, rider_user, helper_user):
    h_user, _, helper = helper_user
    r_user, profile = rider_user
    
    tr = TravelRequest.objects.create(
        rider=profile,
        pickup_location="A",
        destination="B",
        travel_date=(date.today() + timedelta(days=2)),
        status="Waiting for Helper Response",
        assigned_helper=helper
    )
    
    api_client.force_authenticate(user=h_user)
    
    response = api_client.patch(f"/api/travel-requests/{tr.id}/accept/", format="json")
    assert response.status_code == 200
    
    tr.refresh_from_db()
    assert tr.status == "Assigned"

@pytest.mark.django_db
def test_decline_ride(api_client, rider_user, helper_user):
    h_user, _, helper = helper_user
    r_user, profile = rider_user
    
    tr = TravelRequest.objects.create(
        rider=profile,
        pickup_location="A",
        destination="B",
        travel_date=(date.today() + timedelta(days=2)),
        status="Waiting for Helper Response",
        assigned_helper=helper
    )
    
    MatchRecommendation.objects.create(
        travel_request=tr,
        helper=helper,
        status="Active",
        match_score=100
    )
    
    api_client.force_authenticate(user=h_user)
    
    response = api_client.post(f"/api/travel-requests/{tr.id}/helper-decline/", format="json")
    assert response.status_code == 200
    
    tr.refresh_from_db()
    assert tr.status == "Searching for another helper"

@pytest.mark.django_db
def test_complete_ride(api_client, rider_user, helper_user):
    h_user, _, helper = helper_user
    r_user, profile = rider_user
    
    tr = TravelRequest.objects.create(
        rider=profile,
        pickup_location="A",
        destination="B",
        travel_date=(date.today() + timedelta(days=2)),
        status="Assigned",
        assigned_helper=helper
    )
    
    api_client.force_authenticate(user=h_user)
    
    response = api_client.patch(f"/api/travel-requests/{tr.id}/complete/", format="json")
    assert response.status_code == 200
    
    tr.refresh_from_db()
    assert tr.status == "Completed"

@pytest.mark.django_db
@patch("care_ride.supabase_client.get_supabase")
def test_view_certificate_access(mock_supabase, api_client, rider_user, helper_user):
    h_user, _, helper = helper_user
    r_user, profile = rider_user
    
    tr = TravelRequest.objects.create(
        rider=profile,
        pickup_location="A",
        destination="B",
        travel_date=(date.today() + timedelta(days=2)),
        status="Assigned",
        assigned_helper=helper
    )
    
    DisabilityCertificate.objects.create(user=profile, file_name="test.pdf", file_url="test/url")
    
    mock_supabase_client = Mock()
    mock_supabase_client.storage.from_.return_value.create_signed_url.return_value = {"signedURL": "http://signed"}
    mock_supabase.return_value = mock_supabase_client
    
    # Helper assigned should have access
    api_client.force_authenticate(user=h_user)
    response = api_client.get(f"/api/travel-requests/{tr.id}/certificate/")
    assert response.status_code == 200
    assert response.data["url"] == "http://signed"
    
    # Unassigned helper should NOT have access
    unassigned_user = User.objects.create_user(username="helper2", password="pwd")
    unassigned_user.auth_user_id = "00000000-0000-0000-0000-000000000003"
    unassigned_user.save()
    api_client.force_authenticate(user=unassigned_user)
    
    response2 = api_client.get(f"/api/travel-requests/{tr.id}/certificate/")
    assert response2.status_code == 403
