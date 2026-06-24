from django.urls import path

from .views import (
    register,
    login,
    UploadCertificateView,
    my_profile
)

urlpatterns = [
    path(
        "register/",
        register
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