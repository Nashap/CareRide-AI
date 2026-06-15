from django.urls import path
from .views import RecommendHelperView

urlpatterns = [
    path(
        "recommend-helper/",
        RecommendHelperView.as_view(),
        name="recommend-helper"
    ),
]