from django.urls import path
from .views import register, login, UploadCertificateView

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('upload-certificate/', UploadCertificateView.as_view(), name='upload-certificate'),
]