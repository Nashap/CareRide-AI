from rest_framework import serializers
from .models import Helper


class HelperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Helper
        fields = "__all__"