import pytest

from helpers.models import Helper
from users.models import UserProfile
from rides.models import TravelRequest


@pytest.mark.django_db
def test_helper_creation():

    helper = Helper.objects.create(
        name="John",
        skills="Wheelchair assistance",
        rating=4.5,
        availability=True,
    )

    assert helper.name == "John"
    assert helper.rating == 4.5


@pytest.mark.django_db
def test_userprofile_creation():

    user = UserProfile.objects.create(
        name="Nasha",
        email="nasha@test.com",
        role="rider",
        disability_type="Wheelchair",
        emergency_contact_name="Parent",
        emergency_contact_phone="1234567890",
    )

    assert user.name == "Nasha"
    assert user.role == "rider"


@pytest.mark.django_db
def test_travel_request_creation():

    user = UserProfile.objects.create(
        name="Nasha",
        email="travel@test.com",
        role="rider",
        disability_type="Wheelchair",
        emergency_contact_name="Parent",
        emergency_contact_phone="1234567890",
    )

    travel_request = TravelRequest.objects.create(
        rider=user,
        pickup_location="A",
        destination="B",
        travel_date="2026-06-20",
        service_type="Hospital visit",
        assistance_type="Wheelchair assistance",
        assistance_level="Medium",
        additional_note="Test ride",
    )

    assert travel_request.destination == "B"
    assert travel_request.rider == user