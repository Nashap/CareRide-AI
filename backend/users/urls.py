from django.urls import path

from .views import (
    RegisterAPIView,
    login,
    UploadCertificateView,
    my_profile
)

urlpatterns = [
    path(
        "register/",
        RegisterAPIView.as_view()
    ),

    path(
        "login/",
        login
    ),

    path(
        "profile/",
        my_profile
    ),

    path(
        "upload-certificate/",
        UploadCertificateView.as_view(),
        name="upload-certificate"
    ),
]