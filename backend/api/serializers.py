# api/serializers.py

from rest_framework import serializers
from .models import Task, Subtask


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ["id", "title", "cost", "is_completed"]


class TaskSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source="client.username", read_only=True)
    tasker_username = serializers.SerializerMethodField()
    tasker_id = serializers.SerializerMethodField()
    subtasks = SubtaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "budget",
            "urgency",
            "location",
            "status",
            "client_username",
            "tasker_username",
            "tasker_id",
            "expires_from_feed",
            "must_start_by",
            "created_at",
            "updated_at",
            "latitude",
            "longitude",
            "category",
            "subcategory",
            "subtasks",
        ]

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)

    def get_tasker_username(self, obj):
        return obj.tasker.username if obj.tasker else ""

    def get_tasker_id(self, obj):
        return obj.tasker.id if obj.tasker else None

    def validate_latitude(self, value):
        return value

    def validate_longitude(self, value):
        return value
