# api/serializers.py

from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source="client.username", read_only=True)
    worker_username = serializers.SerializerMethodField()
    worker_id = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "description",
            "budget",
            "location",
            "status",
            "cancelled",
            "client_username",
            "worker_username",
            "worker_id",
        ]

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)

    def get_worker_username(self, obj):
        return obj.worker.username if obj.worker else ""

    def get_worker_id(self, obj):
        return obj.worker.id if obj.worker else None
