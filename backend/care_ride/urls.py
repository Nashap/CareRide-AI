from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
def home(request):
    return JsonResponse({
        "status": "CareRide API Running"
    })
urlpatterns = [
    path("", home),

    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema"
    ),
    path(
        'api/schema/',
        SpectacularAPIView.as_view(),
        name='schema'
    ),

    path(
        'api/schema/swagger-ui/',
        SpectacularSwaggerView.as_view(
            url_name='schema'
        ),
        name='swagger-ui'
    ),

    path('admin/', admin.site.urls),

    # Your existing APIs
    path('api/', include('users.urls')),
    path('api/', include('rides.urls')),
    path("api/ai/", include("ai_services.urls")),
    path('api/', include('helpers.urls')),

    # JWT Token APIs
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
