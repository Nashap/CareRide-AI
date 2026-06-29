from django.urls import path

from .views import (
    RecommendHelperView,
    ai_chat_view,
)

urlpatterns = [

    path(
        "recommend-helper/",
        RecommendHelperView.as_view(),
        name="recommend-helper"
    ),

    path(
        "chat/",
        ai_chat_view,
        name="ai-chat"
    ),

]