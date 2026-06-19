import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_helper_list_requires_auth():

    client = APIClient()

    response = client.get(
        "/api/helpers/"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_travel_request_list_requires_auth():

    client = APIClient()

    response = client.get(
        "/api/travel-requests/"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_authenticated_helper_access():

    user = User.objects.create_user(
        username="testuser",
        password="password123"
    )

    client = APIClient()

    client.force_authenticate(
        user=user
    )

    response = client.get(
        "/api/helpers/"
    )

    assert response.status_code == 200


@pytest.mark.django_db
def test_authenticated_travel_request_access():

    user = User.objects.create_user(
        username="testuser",
        password="password123"
    )

    client = APIClient()

    client.force_authenticate(
        user=user
    )

    response = client.get(
        "/api/travel-requests/"
    )

    assert response.status_code == 200