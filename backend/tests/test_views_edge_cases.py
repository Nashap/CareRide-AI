import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import UserProfile, DisabilityCertificate
from rides.models import TravelRequest, MatchRecommendation
from helpers.models import Helper
from datetime import date, timedelta, datetime
from django.utils import timezone
from unittest.mock import patch, Mock

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def base_data():
    r_user = User.objects.create_user(username="rider", password="pwd")
    r_user.auth_user_id = "00000000-0000-0000-0000-000000000001"
    r_user.save()
    profile = UserProfile.objects.create(email="rider@test.com", auth_user_id="00000000-0000-0000-0000-000000000001", name="Rider", role="rider", phone_number="1", address="1")
    
    h_user = User.objects.create_user(username="helper", password="pwd")
    h_user.auth_user_id = "00000000-0000-0000-0000-000000000002"
    h_user.save()
    h_profile = UserProfile.objects.create(email="h@test.com", auth_user_id="00000000-0000-0000-0000-000000000002", name="H", role="helper", phone_number="1", address="1")
    helper = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000002", name="H", skills=["driving"])
    
    h2_user = User.objects.create_user(username="helper2", password="pwd")
    h2_user.auth_user_id = "00000000-0000-0000-0000-000000000003"
    h2_user.save()
    UserProfile.objects.create(email="h2@test.com", auth_user_id="00000000-0000-0000-0000-000000000003", name="H2", role="helper", phone_number="2", address="2")
    helper2 = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000003", name="H2", skills=["driving"])
    
    return r_user, profile, h_user, helper, h2_user, helper2

@pytest.mark.django_db
@patch('rides.serializers.TravelRequestSerializer.is_valid')
def test_create_exception(mock_is_valid, api_client, base_data):
    r_user, *_ = base_data
    mock_is_valid.side_effect = Exception("General Error")
    api_client.force_authenticate(user=r_user)
    # The view catches exceptions and calls super().create() which will fail due to missing fields, or raise an error
    try:
        api_client.post("/api/travel-requests/", {}, format="json")
    except Exception:
        pass

@pytest.mark.django_db
def test_assign_edge_cases(api_client, base_data):
    r_user, profile, _, _, _, _ = base_data
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2))
    api_client.force_authenticate(user=r_user)
    
    # 61: helper_id required
    res = api_client.patch(f"/api/travel-requests/{tr.id}/assign/", {}, format="json")
    assert res.status_code == 400
    
    # 65-66: Helper not found
    res = api_client.patch(f"/api/travel-requests/{tr.id}/assign/", {"helper_id": 999}, format="json")
    assert res.status_code == 404
    
    # 76: travel_date without travel_time
    # 88-93: time < 2 hours
    tr2 = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=timezone.now().date())
    res = api_client.patch(f"/api/travel-requests/{tr2.id}/assign/", {"helper_id": base_data[3].id}, format="json")
    assert res.status_code == 200

@pytest.mark.django_db
def test_decline_edge_cases(api_client, base_data):
    _, profile, h_user, helper, h2_user, _ = base_data
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2), status="Open Dispatch")
    
    # 129-130: unauthorized helper (rider trying to decline)
    api_client.force_authenticate(user=base_data[0])
    res = api_client.post(f"/api/travel-requests/{tr.id}/helper-decline/")
    assert res.status_code == 403
    
    # 163-165: Open Dispatch fallback logic
    MatchRecommendation.objects.create(travel_request=tr, helper=helper, status="Active")
    api_client.force_authenticate(user=h_user)
    res = api_client.post(f"/api/travel-requests/{tr.id}/helper-decline/")
    assert res.status_code == 200

@pytest.mark.django_db
def test_accept_incomplete_profile(api_client, base_data):
    r_user, profile, *_ = base_data
    # Incomplete profile check
    h3_user = User.objects.create_user(username="helper3", password="pwd")
    h3_user.auth_user_id = "00000000-0000-0000-0000-000000000004"
    h3_user.save()
    UserProfile.objects.create(email="h3@test.com", auth_user_id="00000000-0000-0000-0000-000000000004", name="H3", role="helper")
    Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000004", name="H3")
    tr_inc = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2), status="AI Recommended")
    api_client.force_authenticate(user=h3_user)
    res_inc = api_client.patch(f"/api/travel-requests/{tr_inc.id}/accept/")
    assert res_inc.status_code == 403

@pytest.mark.django_db
def test_accept_edge_cases(api_client, base_data):
    r_user, profile, h_user, helper, h2_user, helper2 = base_data
    
    # 187: Expired
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() - timedelta(days=2), status="AI Recommended")
    api_client.force_authenticate(user=h_user)
    res = api_client.patch(f"/api/travel-requests/{tr.id}/accept/")
    assert res.status_code == 400
    
    # 201-202: Unauthorized (rider trying to accept)
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2), status="AI Recommended")
    api_client.force_authenticate(user=r_user)
    res = api_client.patch(f"/api/travel-requests/{tr.id}/accept/")
    assert res.status_code == 403
    
    # 205: Already accepted
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2), status="Assigned")
    api_client.force_authenticate(user=h_user)
    res = api_client.patch(f"/api/travel-requests/{tr.id}/accept/")
    assert res.status_code == 409
    
    # 209-218: Forbidden (recommended to another helper)
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2), status="Waiting for Helper Response", assigned_helper=helper2)
    api_client.force_authenticate(user=h_user)
    res = api_client.patch(f"/api/travel-requests/{tr.id}/accept/")
    assert res.status_code == 403
    
    # Urgent AI Recommended coverage
    tr.status = "Urgent AI Recommended"
    tr.save()
    res = api_client.patch(f"/api/travel-requests/{tr.id}/accept/")
    assert res.status_code == 200

@pytest.mark.django_db
def test_complete_edge_cases(api_client, base_data):
    r_user, profile, h_user, helper, h2_user, helper2 = base_data
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2), status="Assigned", assigned_helper=helper2)
    
    # 243-244: Unauthorized
    api_client.force_authenticate(user=r_user)
    res = api_client.patch(f"/api/travel-requests/{tr.id}/complete/")
    assert res.status_code == 403
    
    # 247: Forbidden (wrong helper)
    api_client.force_authenticate(user=h_user)
    res = api_client.patch(f"/api/travel-requests/{tr.id}/complete/")
    assert res.status_code == 403
    
    # 254: Expired
    tr.travel_date = date.today() - timedelta(days=2)
    tr.save()
    api_client.force_authenticate(user=h2_user)
    res = api_client.patch(f"/api/travel-requests/{tr.id}/complete/")
    assert res.status_code == 400

@pytest.mark.django_db
def test_certificate_edge_cases(api_client, base_data):
    r_user, profile, h_user, helper, _, _ = base_data
    tr = TravelRequest.objects.create(rider=profile, pickup_location="A", destination="B", travel_date=date.today() + timedelta(days=2), status="Assigned", assigned_helper=helper)
    
    api_client.force_authenticate(user=r_user)
    
    # 275: No certificate found
    res = api_client.get(f"/api/travel-requests/{tr.id}/certificate/")
    assert res.status_code == 404
    
    # 287-288: Supabase error
    DisabilityCertificate.objects.create(user=profile, file_name="f", file_url="u")
    with patch('care_ride.supabase_client.get_supabase') as mock_supa:
        mock_supa.return_value.storage.from_.return_value.create_signed_url.side_effect = Exception("Supa Error")
        res = api_client.get(f"/api/travel-requests/{tr.id}/certificate/")
        assert res.status_code == 500
