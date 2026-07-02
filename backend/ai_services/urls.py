from django.urls import path

from .views import (
    RecommendHelperView,
    RecommendationDetailView,
    ai_chat_view,
)

urlpatterns = [

    path(
        "recommend-helper/",
        RecommendHelperView.as_view(),
        name="recommend-helper"
    ),

    path(
        "recommendation/<int:travel_request_id>/",
        RecommendationDetailView.as_view(),
        name="recommendation-detail"
    ),

    path(
        "chat/",
        ai_chat_view,
        name="ai-chat"
    ),

]