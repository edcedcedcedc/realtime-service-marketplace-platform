# api/serializers.py

from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["id", "title", "description", "budget", "location", "status"]

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)
