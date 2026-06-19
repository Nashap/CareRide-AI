import pytest

from helpers.models import Helper
from users.models import Passenger
from rides.models import TravelRequest


@pytest.mark.django_db
def test_helper_creation():

    helper = Helper.objects.create(
        name="John",
        skills="Wheelchair assistance",
        rating=4.5,
        availability=True
    )

    assert helper.name == "John"
    assert helper.rating == 4.5


@pytest.mark.django_db
def test_passenger_creation():

    passenger = Passenger.objects.create(
        name="Nasha",
        email="nasha@test.com",
        disability_type="Wheelchair",
        emergency_contact="1234567890"
    )

    assert passenger.name == "Nasha"


@pytest.mark.django_db
def test_travel_request_creation():

    passenger = Passenger.objects.create(
        name="Nasha",
        email="travel@test.com",
        disability_type="Wheelchair",
        emergency_contact="1234567890"
    )

    travel_request = TravelRequest.objects.create(
        pickup_location="A",
        destination="B",
        travel_date="2026-06-20",
        service_type="Hospital visit",
        assistance_type="Wheelchair assistance",
        passenger=passenger
    )

    assert travel_request.destination == "B"