import pytest
from django.core.management import call_command
from django.utils import timezone
from datetime import timedelta
from rides.models import MatchRecommendation, TravelRequest
from users.models import UserProfile
from helpers.models import Helper

@pytest.mark.django_db
def test_process_timeouts_command():
    from unittest.mock import patch
    rider = UserProfile.objects.create(name="Rider", email="rider@test.com", role="rider", auth_user_id="00000000-0000-0000-0000-000000000001")
    tr = TravelRequest.objects.create(
        rider=rider, pickup_location="A", destination="B", travel_date=timezone.now().date() - timedelta(days=1),
        service_type="Hospital", assistance_type="Wheelchair", assistance_level="High", status="AI Recommended"
    )
    
    call_command("process_timeouts")
    
    tr.refresh_from_db()
    assert tr.status == "Expired"
    
    with patch('time.sleep', side_effect=KeyboardInterrupt):
        call_command("process_timeouts", loop=True, interval=1)
