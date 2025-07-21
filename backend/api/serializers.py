# api/serializers.py

from django.conf import settings
from rest_framework import serializers
from .models import Profile, Task, Subtask, TaskRequest, User


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ["id", "title", "cost", "is_completed"]


class TaskSerializer(serializers.ModelSerializer):
    # client_username = serializers.CharField(source="client.username", read_only=True)
    # client_id = serializers.IntegerField(source="client.id", read_only=True)
    # tasker_username = serializers.SerializerMethodField()
    # tasker_id = serializers.SerializerMethodField()
    subtasks = SubtaskSerializer(many=True, read_only=True)

    terms_accepted_client_at = serializers.SerializerMethodField()
    terms_accepted_tasker_at = serializers.SerializerMethodField()

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
            "client",
            "tasker",
            "expires_from_feed",
            "must_start_by",
            "created_at",
            "updated_at",
            "completed_at",
            "latitude",
            "longitude",
            "category",
            "subcategory",
            "subtasks",
            "terms_accepted_client_at",
            "terms_accepted_tasker_at",
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

    def get_terms_accepted_client_at(self, obj):
        if obj.terms_accepted_client_at:
            return obj.terms_accepted_client_at.accepted_at.isoformat()
        return None

    def get_terms_accepted_tasker_at(self, obj):
        if obj.terms_accepted_tasker_at:
            return obj.terms_accepted_tasker_at.accepted_at.isoformat()
        return None


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class ClientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            "user",
            "name",
            "family_name",
            "bio",
            "rating",
            "tasks_posted",
        ]


class TaskerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            "user",
            "name",
            "family_name",
            "bio",
            "rating",
            "tasks_done",
            "category",
            "eta",
        ]


class TaskRequestSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="task.id", read_only=True)
    tasker_id = serializers.IntegerField(source="tasker.id", read_only=True)
    tasker_username = serializers.CharField(source="tasker.username", read_only=True)
    client_id = serializers.IntegerField(source="task.client.id", read_only=True)
    tasker_name = serializers.CharField(source="tasker.profile.name", read_only=True)
    tasker_family_name = serializers.CharField(
        source="tasker.profile.family_name", read_only=True
    )
    tasker_rating = serializers.FloatField(
        source="tasker.profile.rating", read_only=True
    )
    tasks_done = serializers.IntegerField(
        source="tasker.profile.tasks_done", read_only=True
    )
    category = serializers.CharField(source="tasker.profile.category", read_only=True)
    eta = serializers.CharField(source="tasker.profile.eta", read_only=True)

    class Meta:
        model = TaskRequest
        fields = [
            "id",  # task request id, rendered in the UI, InspectRequestModal and used as an ID for the flatlist
            "task_id",
            "tasker_id",
            "client_id",
            "tasker_username",
            "tasker_name",
            "tasker_family_name",
            "tasker_rating",
            "tasks_done",
            "category",
            "eta",
            "created_at",
        ]
