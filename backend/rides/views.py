from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiResponse, OpenApiExample

from .models import TravelRequest
from .serializers import TravelRequestSerializer
from helpers.models import Helper


@extend_schema_view(
    list=extend_schema(
        tags=["Travel Requests"],
        summary="List Travel Requests",
        description="Returns a list of all travel requests. Supports filtering by service_type, status, etc."
    ),
    retrieve=extend_schema(
        tags=["Travel Requests"],
        summary="Retrieve a Travel Request",
        description="Returns a specific travel request by its ID."
    ),
    create=extend_schema(
        tags=["Travel Requests"],
        summary="Create a Travel Request",
        description="Riders use this to create a new travel request. The rider ID is automatically inferred from the authenticated user."
    ),
    update=extend_schema(
        tags=["Travel Requests"],
        summary="Update a Travel Request",
        description="Updates an existing travel request."
    ),
    partial_update=extend_schema(
        tags=["Travel Requests"],
        summary="Partially update a Travel Request"
    ),
    destroy=extend_schema(
        tags=["Travel Requests"],
        summary="Delete a Travel Request"
    ),
    assign=extend_schema(
        tags=["Travel Requests"],
        summary="Assign a Helper to a Request",
        description="Assigns a specific helper to this travel request based on the AI recommendation workflow."
    ),
    helper_decline=extend_schema(
        tags=["Travel Requests"],
        summary="Helper Declines Request",
        description="Allows a helper to decline a travel request assigned/recommended to them."
    ),
    accept=extend_schema(
        tags=["Travel Requests"],
        summary="Helper Accepts Request",
        description="Allows a helper to accept a travel request. Only the recommended helper can accept in exclusive mode."
    ),
    complete=extend_schema(
        tags=["Travel Requests"],
        summary="Complete a Travel Request",
        description="Marks an assigned travel request as Completed. Can only be done by the assigned helper."
    ),
    certificate=extend_schema(
        tags=["Travel Requests"],
        summary="Get Rider Certificate",
        description="Allows the assigned helper or the rider to download the rider's disability certificate for verification."
    )
)
class TravelRequestViewSet(viewsets.ModelViewSet):
    queryset = TravelRequest.objects.all()

    def get_queryset(self):
        qs = TravelRequest.objects.select_related("rider", "assigned_helper").prefetch_related("recommendations").all().order_by("-created_at")
        
        return qs

    serializer_class = TravelRequestSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        "service_type",
        "assistance_type",
        "assistance_level",
        "status",
        "rider",
    ]

    def create(self, request, *args, **kwargs):
        try:
            from users.models import UserProfile
            profile = UserProfile.objects.get(auth_user_id=request.user.auth_user_id)
            from users.serializers import UserProfileSerializer
            serializer = UserProfileSerializer(profile)
            if not serializer.data.get("profile_completed"):
                return Response({"error": "Please complete your profile before booking a ride."}, status=403)
                
            # Forcibly inject the authenticated user's profile ID as the rider
            mutable_data = request.data.copy()
            mutable_data['rider'] = profile.id
            serializer = self.get_serializer(data=mutable_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=201, headers=headers)
        except Exception as e:
            # Fallback to default if exception not related to profile exists
            return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], url_path="assign")
    def assign(self, request, pk=None):
        travel_request = self.get_object()
        helper_id = request.data.get("helper_id")

        if not helper_id:
            return Response({"error": "helper_id is required"}, status=400)

        try:
            helper = Helper.objects.get(id=helper_id)
        except Helper.DoesNotExist:
            return Response({"error": "Helper not found"}, status=404)

        from .models import MatchRecommendation
        from django.utils import timezone
        from datetime import datetime, timedelta
        
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

        time_remaining = ride_datetime - now if ride_datetime else timedelta(hours=48)

        if time_remaining < timedelta(hours=2):
            # Less than 2 hours: Skip exclusive mode, go straight to Open Dispatch
            travel_request.assigned_helper = None
            travel_request.status = "Open Dispatch"
            travel_request.save()
            
            # Activate ALL pending recommendations (Top 3)
            MatchRecommendation.objects.filter(
                travel_request=travel_request,
                status="Pending"
            ).update(
                status="Active", 
                activated_at=now,
                response_deadline=ride_datetime
            )
        else:
            # More than 2 hours: AI Exclusive Window for selected helper
            travel_request.assigned_helper = helper
            travel_request.status = "Waiting for Helper Response"
            travel_request.save()
            
            window_minutes = 120 if time_remaining > timedelta(hours=24) else 30
            expiration_time = now + timedelta(minutes=window_minutes)
            deadline = min(expiration_time, ride_datetime) if ride_datetime else expiration_time
            
            MatchRecommendation.objects.filter(
                travel_request=travel_request,
                helper=helper
            ).update(
                status="Active", 
                activated_at=now,
                response_deadline=deadline
            )

        serializer = self.get_serializer(travel_request)
        return Response(serializer.data, status=200)

    @action(detail=True, methods=["post"], url_path="helper-decline")
    def helper_decline(self, request, pk=None):
        travel_request = self.get_object()
        
        try:
            helper = Helper.objects.get(auth_user_id=request.user.auth_user_id)
        except Helper.DoesNotExist:
            return Response({"error": "Unauthorized"}, status=403)
            
        from .models import MatchRecommendation
        from django.utils import timezone
        
        # Find this helper's active recommendation and decline it
        current_rec = MatchRecommendation.objects.filter(
            travel_request=travel_request,
            helper=helper,
            status="Active"
        ).first()
        
        if current_rec:
            current_rec.status = "Declined"
            current_rec.save()
            
        # Switch to Open Dispatch Mode: Activate ALL other Pending recommendations
        pending_recs = MatchRecommendation.objects.filter(
            travel_request=travel_request,
            status="Pending"
        )
        if pending_recs.exists():
            pending_recs.update(
                status="Active",
                activated_at=timezone.now()
            )
            
        # Since this helper declined, we should keep the others active. 
        # If the current status was Waiting for Helper Response, change it to Searching for another helper.
        if travel_request.status == "Waiting for Helper Response":
            travel_request.status = "Searching for another helper"
            travel_request.assigned_helper = None
            travel_request.save()
        elif travel_request.status == "Open Dispatch":
            # If all are declined, fallback logic in timeouts will handle it
            pass

        return Response({
            "message": "Ride declined successfully",
            "travel_request_id": travel_request.id,
            "status": travel_request.status
        }, status=200)

    @action(detail=True, methods=["patch"], url_path="accept")
    def accept(self, request, pk=None):
        from django.db import transaction
        
        with transaction.atomic():
            # First Accept Wins: Row-level lock to prevent race conditions
            travel_request = TravelRequest.objects.select_for_update().get(pk=pk)
            
            from .utils import process_recommendation_timeouts
            process_recommendation_timeouts(travel_request)
            # Fetch again to ensure we have the absolute latest state after timeout processing
            travel_request.refresh_from_db()

            if travel_request.status == "Expired":
                return Response({"error": "This ride has already expired."}, status=400)

            try:
                from users.models import UserProfile
                from users.serializers import UserProfileSerializer
                profile = UserProfile.objects.get(auth_user_id=request.user.auth_user_id)
                prof_serializer = UserProfileSerializer(profile)
                if not prof_serializer.data.get("profile_completed"):
                    return Response({"error": "Please complete your profile before accepting ride requests."}, status=403)
            except:
                pass

            try:
                helper = Helper.objects.get(auth_user_id=request.user.auth_user_id)
            except Helper.DoesNotExist:
                return Response({"error": "Unauthorized. Only helpers can accept rides."}, status=403)
                
            if travel_request.status in ["Assigned", "Completed"]:
                return Response({"error": "This ride has already been accepted."}, status=409)
                
            if travel_request.status in ["AI Recommended", "Waiting for Helper Response"]:
                if travel_request.assigned_helper != helper:
                    return Response({"error": "Forbidden. This ride was recommended to another helper."}, status=403)
            elif travel_request.status in ["Urgent AI Recommended", "Open Dispatch"]:
                # For open dispatch / urgent, check if this helper actually has an active recommendation
                from .models import MatchRecommendation
                is_active = MatchRecommendation.objects.filter(travel_request=travel_request, helper=helper, status="Active").exists()
                # Or if they just found it in browse requests! Browse requests allow ANY active helper to accept.
                pass
            elif travel_request.status in ["Searching for Another Helper", "Waiting for available helper", "Pending"]:
                # Anyone can accept these!
                pass
                    
            travel_request.assigned_helper = helper
            travel_request.status = "Assigned"
            travel_request.save()
            
            from .models import MatchRecommendation
            MatchRecommendation.objects.filter(
                travel_request=travel_request, helper=helper
            ).update(status="Accepted")
            
            # Everyone else who was active/pending is now expired
            MatchRecommendation.objects.filter(
                travel_request=travel_request
            ).exclude(helper=helper).update(status="Expired")
            
        serializer = self.get_serializer(travel_request)
        return Response(serializer.data, status=200)

    @action(detail=True, methods=["patch"], url_path="complete")
    def complete(self, request, pk=None):
        travel_request = self.get_object()
        
        try:
            helper = Helper.objects.get(auth_user_id=request.user.auth_user_id)
        except Helper.DoesNotExist:
            return Response({"error": "Unauthorized. Only helpers can complete rides."}, status=403)
            
        if travel_request.assigned_helper != helper:
            return Response({"error": "Forbidden. You are not assigned to this ride."}, status=403)
            
        from .utils import process_recommendation_timeouts
        process_recommendation_timeouts(travel_request)
        travel_request.refresh_from_db()
        
        if travel_request.status == "Expired":
            return Response({"error": "This ride has already expired."}, status=400)
            
        travel_request.status = "Completed"
        travel_request.save()
        
        serializer = self.get_serializer(travel_request)
        return Response(serializer.data, status=200)

    @action(detail=True, methods=["get"], url_path="certificate")
    def certificate(self, request, pk=None):
        travel_request = self.get_object()
        user_auth_id = str(request.user.auth_user_id)
        
        is_rider = str(travel_request.rider.auth_user_id) == user_auth_id
        is_assigned_helper = (travel_request.assigned_helper and str(travel_request.assigned_helper.auth_user_id) == user_auth_id)
        
        if not (is_rider or is_assigned_helper):
            return Response({"error": "Forbidden"}, status=403)
            
        certificate = travel_request.rider.certificates.order_by("-uploaded_at").first()
        if not certificate:
            return Response({"error": "No certificate found"}, status=404)
            
        try:
            from care_ride.supabase_client import get_supabase
            supabase = get_supabase()
            res = supabase.storage.from_("disability-certificates").create_signed_url(
                certificate.file_url, 
                3600,
                options={"download": certificate.file_name}
            )
            signed_url = res.get("signedURL") or res.get("signedUrl") if isinstance(res, dict) else res
            return Response({"url": signed_url})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
