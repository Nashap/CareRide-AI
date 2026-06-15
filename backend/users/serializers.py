from rest_framework import serializers
from .models import DisabilityCertificate

class DisabilityCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DisabilityCertificate
        fields = '__all__'