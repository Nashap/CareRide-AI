from rest_framework.routers import DefaultRouter
from .views import TravelRequestViewSet

router = DefaultRouter()
router.register(r'travel-requests', TravelRequestViewSet)

urlpatterns = router.urls