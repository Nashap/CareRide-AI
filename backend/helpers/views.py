from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiResponse, OpenApiExample

from .models import Helper
from .serializers import HelperSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["Helpers"],
        summary="List all helpers",
        description="Returns a paginated list of all helpers."
    ),
    retrieve=extend_schema(
        tags=["Helpers"],
        summary="Retrieve a helper",
        description="Returns details for a specific helper by ID."
    ),
    create=extend_schema(
        tags=["Helpers"],
        summary="Create a helper",
        description="Creates a new helper profile. Note: Helper profiles are automatically managed via the profile update endpoint, but this provides manual administrative control.",
        responses={201: OpenApiResponse(description="Created successfully")}
    ),
    update=extend_schema(
        tags=["Helpers"],
        summary="Update a helper",
        description="Fully updates an existing helper profile."
    ),
    partial_update=extend_schema(
        tags=["Helpers"],
        summary="Partially update a helper",
        description="Partially updates an existing helper profile (e.g. changing availability)."
    ),
    destroy=extend_schema(
        tags=["Helpers"],
        summary="Delete a helper",
        description="Deletes a helper profile."
    )
)
class HelperViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations for helper profiles.

    This ViewSet allows authenticated users to create,
    retrieve, update, and delete helper records. Helper
    information includes skills, availability status,
    and ratings used by the AI recommendation system
    to match helpers with travel requests.
    """

    queryset = Helper.objects.all().order_by('id')
    serializer_class = HelperSerializer
    permission_classes = [IsAuthenticated]
