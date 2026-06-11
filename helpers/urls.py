from rest_framework.routers import DefaultRouter
from .views import HelperViewSet

router = DefaultRouter()
router.register(r'helpers', HelperViewSet)

urlpatterns = router.urls