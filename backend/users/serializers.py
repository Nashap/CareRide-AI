from rest_framework import serializers
from .models import DisabilityCertificate


class DisabilityCertificateSerializer(serializers.ModelSerializer):
    """
    Serializes disability certificate data for API requests
    and responses.

    This serializer handles validation and conversion of
    disability certificate records, including uploaded
    document information associated with passengers.
    """

    class Meta:
        model = DisabilityCertificate
        fields = '__all__'