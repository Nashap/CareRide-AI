from django.urls import path

from .views import (
    RegisterAPIView,
    login,
    UploadCertificateView,
    my_profile,
    my_certificate
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

    path(
        "profile/certificate/",
        my_certificate,
        name="my-certificate"
    ),
]