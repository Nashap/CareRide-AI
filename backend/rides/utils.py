from django.utils import timezone
from datetime import timedelta, datetime
import logging

logger = logging.getLogger(__name__)

def process_recommendation_timeouts(travel_request):
    """
    Evaluates whether the active AI recommendation has expired,
    and whether the travel request itself is past the ride time.
    Dynamically switches between Sequential and Urgent modes based on time remaining.
    """
    if travel_request.status not in [
        "AI Recommended", 
        "Waiting for Helper Response", 
        "Searching for another helper", 
        "Waiting for another available helper",
        "Pending",
        "Urgent AI Recommended",
        "Open Dispatch",
        "Assigned"
    ]:
        return

    now = timezone.now()
    
    ride_datetime = None
    if travel_request.travel_date:
        if travel_request.travel_time:
            ride_datetime = timezone.make_aware(
                datetime.combine(travel_request.travel_date, travel_request.travel_time)
            )
        else:
            ride_datetime = timezone.make_aware(
                datetime.combine(travel_request.travel_date, datetime.max.time())
            )
            
    # Check if the ride has completely expired
    if ride_datetime and now >= ride_datetime:
        travel_request.status = "Expired"
        # Only unassign if it's not completed
        if travel_request.status != "Completed":
            travel_request.assigned_helper = None
        travel_request.save()
        travel_request.recommendations.filter(status__in=["Pending", "Active", "Accepted"]).update(status="Expired")
        logger.info(f"Ride #{travel_request.id} expired automatically at {now.strftime('%Y-%m-%d %H:%M')}.")
        return

    # If it is assigned, we only cared about expiring it if time passed.
    # Otherwise, it doesn't need sequential/urgent matching.
    if travel_request.status == "Assigned":
        return

    # Calculate time remaining
    time_remaining = ride_datetime - now if ride_datetime else timedelta(hours=48)

    # CASE 3: Urgent Ride (< 2 hours)
    if time_remaining < timedelta(hours=2):
        if travel_request.status not in ["Urgent AI Recommended", "Open Dispatch"]:
            activate_urgent_helpers(travel_request, ride_datetime)
        return

    if travel_request.status == "Open Dispatch":
        return # Stays active until ride_datetime expires completely

    # CASE 1 & 2: Sequential Mode
    # CASE 1 & 2: AI Exclusive Window
    active_rec = travel_request.recommendations.filter(status="Active").first()
    if active_rec:
        if active_rec.response_deadline:
            if now >= active_rec.response_deadline:
                active_rec.status = "Expired"
                active_rec.save()
                activate_open_dispatch(travel_request, ride_datetime)
        elif active_rec.activated_at:
            # Fallback for old records without a deadline saved
            window_minutes = 120 if time_remaining > timedelta(hours=24) else 30
            expiration_time = active_rec.activated_at + timedelta(minutes=window_minutes)
            deadline = min(expiration_time, ride_datetime) if ride_datetime else expiration_time
            if now >= deadline:
                active_rec.status = "Expired"
                active_rec.save()
                activate_open_dispatch(travel_request, ride_datetime)
    else:
        if travel_request.recommendations.filter(status="Pending").exists():
            # If no active recommendation, start Open Dispatch
            activate_open_dispatch(travel_request, ride_datetime)

def activate_open_dispatch(travel_request, ride_datetime):
    """
    Open Dispatch Mode: Activates ALL remaining Pending helpers simultaneously.
    """
    pending_recs = travel_request.recommendations.filter(status="Pending")
    
    if pending_recs.exists():
        pending_recs.update(
            status="Active", 
            activated_at=timezone.now(),
            response_deadline=ride_datetime
        )
        travel_request.assigned_helper = None
        travel_request.status = "Waiting for another available helper"
        travel_request.save()
    else:
        travel_request.assigned_helper = None
        travel_request.status = "Waiting for another available helper"
        travel_request.save()

def activate_next_helper_sequential(travel_request, window_minutes, ride_datetime):
    """
    Sequential Mode: Activates the next best Pending helper in the AI queue.
    """
    next_rec = travel_request.recommendations.filter(status="Pending").order_by('-match_score').first()
    
    if next_rec:
        now = timezone.now()
        next_rec.status = "Active"
        next_rec.activated_at = now
        
        expiration_time = now + timedelta(minutes=window_minutes)
        next_rec.response_deadline = min(expiration_time, ride_datetime) if ride_datetime else expiration_time
        next_rec.save()
        
        travel_request.assigned_helper = next_rec.helper
        
        has_declined_or_expired = travel_request.recommendations.filter(
            status__in=["Declined", "Expired"]
        ).exists()
        
        if has_declined_or_expired:
            travel_request.status = "Searching for another helper"
        else:
            travel_request.status = "Waiting for Helper Response"
            
        travel_request.save()
    else:
        travel_request.assigned_helper = None
        travel_request.status = "Waiting for another available helper"
        travel_request.save()

def activate_urgent_helpers(travel_request, ride_datetime):
    """
    Urgent Mode: Activates ALL Pending helpers simultaneously.
    """
    pending_recs = travel_request.recommendations.filter(status__in=["Pending", "Active"])
    
    if pending_recs.exists():
        pending_recs.update(
            status="Active", 
            activated_at=timezone.now(),
            response_deadline=ride_datetime
        )
        travel_request.assigned_helper = None
        travel_request.status = "Waiting for another available helper"
        travel_request.save()
    else:
        travel_request.assigned_helper = None
        travel_request.status = "Waiting for another available helper"
        travel_request.save()
        
def initialize_recommendations(travel_request):
    """
    Entry point for the AI Service to trigger the scheduling engine.
    """
    process_recommendation_timeouts(travel_request)
