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
    profile = UserProfile.objects.create(email="test2@test.com", auth_user_id="00000000-0000-0000-0000-000000000002", name="Test", phone_number="123", address="123 Main", role="rider")
    # Test required fields and empty values
    serializer = TravelRequestSerializer(data={})
    assert not serializer.is_valid()
    assert "pickup_location" in serializer.errors
    
    # Assuming pickup_location max length is tested by Django automatically,
    # but we can test valid data here.
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