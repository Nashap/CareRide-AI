import pytest
from users.serializers import RegisterSerializer, UserProfileSerializer
from users.models import UserProfile
from helpers.models import Helper
from rides.serializers import TravelRequestSerializer
@pytest.mark.django_db
def test_register_serializer_validation():
    UserProfile.objects.create(email="exist@test.com", name="Exist")
    
    # Valid
    serializer = RegisterSerializer(data={
        "name": "New",
        "email": "NEW@test.com",
        "password": "Password123",
        "role": "rider"
    })
    assert serializer.is_valid()
    assert serializer.validated_data["email"] == "new@test.com"

    # Duplicate email
    serializer = RegisterSerializer(data={
        "name": "Exist",
        "email": "exist@test.com",
        "password": "Password123",
        "role": "rider"
    })
    assert not serializer.is_valid()
    assert "email" in serializer.errors

    # Invalid email
    serializer = RegisterSerializer(data={
        "name": "Invalid",
        "email": "not-an-email",
        "password": "Password123",
        "role": "rider"
    })
    assert not serializer.is_valid()
    assert "email" in serializer.errors

    # Missing fields
    serializer = RegisterSerializer(data={})
    assert not serializer.is_valid()
    assert "name" in serializer.errors

@pytest.mark.django_db
def test_user_profile_serializer_completed():
    profile = UserProfile.objects.create(email="test@test.com", auth_user_id="00000000-0000-0000-0000-000000000001", name="Test", phone_number="123", address="123 Main", role="rider")
    serializer = UserProfileSerializer(profile)
    assert serializer.data["profile_completed"] is True

    # Incomplete rider
    profile.address = ""
    profile.save()
    serializer = UserProfileSerializer(profile)
    assert serializer.data["profile_completed"] is False

    # Incomplete helper (no skills)
    profile.role = "helper"
    profile.address = "123 Main"
    profile.save()
    helper = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000001", name="Test")
    serializer = UserProfileSerializer(profile)
    assert serializer.data["profile_completed"] is False

    # Complete helper
    helper.skills = "Wheelchair"
    helper.save()
    serializer = UserProfileSerializer(profile)
    assert serializer.data["profile_completed"] is True

@pytest.mark.django_db
def test_travel_request_serializer():
    from rides.serializers import TravelRequestSerializer
    from django.utils import timezone
    from datetime import timedelta, time
    
    profile = UserProfile.objects.create(email="test2@test.com", auth_user_id="00000000-0000-0000-0000-000000000002", name="Test", phone_number="123", address="123 Main", role="rider")
    
    # Test required fields and empty values
    serializer = TravelRequestSerializer(data={})
    assert not serializer.is_valid()
    assert "pickup_location" in serializer.errors
    
    # Too short pickup
    serializer = TravelRequestSerializer(data={
        "pickup_location": "A",
        "destination": "Hospital B",
        "travel_date": "2026-07-10",
        "service_type": "Hospital visit",
        "assistance_type": "Wheelchair assistance",
        "rider": profile.id
    })
    assert not serializer.is_valid()
    assert "pickup_location" in serializer.errors
    
    # Too short destination
    serializer = TravelRequestSerializer(data={
        "pickup_location": "Hospital A",
        "destination": "B",
        "travel_date": "2026-07-10",
        "service_type": "Hospital visit",
        "assistance_type": "Wheelchair assistance",
        "rider": profile.id
    })
    assert not serializer.is_valid()
    assert "destination" in serializer.errors

    # Pickup same as destination
    serializer = TravelRequestSerializer(data={
        "pickup_location": "Hospital A",
        "destination": "Hospital A",
        "travel_date": "2026-07-10",
        "service_type": "Hospital visit",
        "assistance_type": "Wheelchair assistance",
        "rider": profile.id
    })
    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors

    # Travel date in past
    past_date = (timezone.now().date() - timedelta(days=1)).strftime("%Y-%m-%d")
    serializer = TravelRequestSerializer(data={
        "pickup_location": "Hospital A",
        "destination": "Hospital B",
        "travel_date": past_date,
        "service_type": "Hospital visit",
        "assistance_type": "Wheelchair assistance",
        "rider": profile.id
    })
    assert not serializer.is_valid()
    assert "travel_date" in serializer.errors
    
    # Travel time in past (today)
    today = timezone.now().date().strftime("%Y-%m-%d")
    past_time = (timezone.now() - timedelta(hours=1)).strftime("%H:%M:%S")
    serializer = TravelRequestSerializer(data={
        "pickup_location": "Hospital A",
        "destination": "Hospital B",
        "travel_date": today,
        "travel_time": past_time,
        "service_type": "Hospital visit",
        "assistance_type": "Wheelchair assistance",
        "rider": profile.id
    })
    assert not serializer.is_valid()
    assert "travel_time" in serializer.errors

    # Valid data
    serializer = TravelRequestSerializer(data={
        "pickup_location": "Hospital A",
        "destination": "Hospital B",
        "travel_date": "2026-07-10",
        "service_type": "Hospital visit",
        "assistance_type": "Wheelchair assistance",
        "assistance_level": "Medium",
        "rider": profile.id
    })
    assert serializer.is_valid(), serializer.errors

@pytest.mark.django_db
def test_travel_request_serializer_methods():
    from rides.serializers import TravelRequestSerializer
    from rides.models import TravelRequest, MatchRecommendation
    from unittest.mock import Mock
    
    rider = UserProfile.objects.create(email="rider2@test.com", auth_user_id="00000000-0000-0000-0000-000000000003", name="Rider2", phone_number="123", role="rider")
    tr = TravelRequest.objects.create(
        rider=rider, pickup_location="A", destination="B", travel_date="2026-07-10",
        service_type="Hospital", assistance_type="Wheelchair", assistance_level="High", status="Assigned"
    )
    
    helper = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000004", name="Helper4")
    tr.assigned_helper = helper
    tr.save()
    
    # Test get_assigned_helper when UserProfile missing
    serializer = TravelRequestSerializer(tr)
    data = serializer.data
    assert data["assigned_helper"]["name"] == "Helper4"
    assert "phone_number" not in data["assigned_helper"]
    
    # Test get_rider_details when rider missing
    mock_tr = Mock()
    mock_tr.rider = None
    assert serializer.get_rider_details(mock_tr) is None
    
    # Test get_my_recommendation edge cases
    mock_request = Mock()
    mock_request.user.is_authenticated = False
    serializer = TravelRequestSerializer(tr, context={'request': mock_request})
    assert serializer.data["my_recommendation"] is None
    
    mock_request.user.is_authenticated = True
    mock_request.user.auth_user_id = "00000000-0000-0000-0000-000000000004"
    
    serializer = TravelRequestSerializer(tr, context={'request': mock_request})
    assert serializer.data["my_recommendation"] is None
    
    MatchRecommendation.objects.create(travel_request=tr, helper=helper, match_score=95, status="Pending")
    helper2 = Helper.objects.create(auth_user_id="00000000-0000-0000-0000-000000000005", name="Helper5")
    MatchRecommendation.objects.create(travel_request=tr, helper=helper2, match_score=99, status="Pending")
    
    serializer = TravelRequestSerializer(tr, context={'request': mock_request})
    rec_data = serializer.data["my_recommendation"]
    assert rec_data["ai_rank"] == 2 # 95 is ranked 2nd
    
    # Missing helper for request user
    mock_request.user.auth_user_id = "00000000-0000-0000-0000-000000000006"
    serializer = TravelRequestSerializer(tr, context={'request': mock_request})
    assert serializer.data["my_recommendation"] is None


@pytest.mark.django_db
def test_helper_serializer_validation():
    from helpers.serializers import HelperSerializer
    
    # Valid
    serializer = HelperSerializer(data={
        "auth_user_id": "00000000-0000-0000-0000-000000000001",
        "name": "John Doe",
        "skills": "Wheelchair, CPR",
        "rating": 4.5
    })
    assert serializer.is_valid()
    
    # Short name
    serializer = HelperSerializer(data={
        "auth_user_id": "00000000-0000-0000-0000-000000000001",
        "name": "Jo",
        "skills": "Wheelchair, CPR",
        "rating": 4.5
    })
    assert not serializer.is_valid()
    assert "name" in serializer.errors

    # Short skills
    serializer = HelperSerializer(data={
        "auth_user_id": "00000000-0000-0000-0000-000000000001",
        "name": "John Doe",
        "skills": "CPR",
        "rating": 4.5
    })
    assert not serializer.is_valid()
    assert "skills" in serializer.errors

    # Invalid rating
    serializer = HelperSerializer(data={
        "auth_user_id": "00000000-0000-0000-0000-000000000001",
        "name": "John Doe",
        "skills": "Wheelchair, CPR",
        "rating": 6.0
    })
    assert not serializer.is_valid()
    assert "rating" in serializer.errors