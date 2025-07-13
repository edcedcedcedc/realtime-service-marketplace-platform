from django.contrib import admin
from api.models import TaskLog, TermsAcceptanceLog


@admin.register(TaskLog)
class TaskLogAdmin(admin.ModelAdmin):
    list_display = (
        "event_type",
        "user",
        "related_task",
        "task_client",
        "task_tasker",
        "task_title",
        "task_budget",
        "timestamp",
        "ip_address",
    )
    list_filter = ("event_type", "timestamp", "task_client", "task_tasker")
    search_fields = (
        "user__username",
        "task_client__username",
        "task_tasker__username",
        "task_title",
        "task_description",
    )
    readonly_fields = (
        "user",
        "event_type",
        "related_task",
        "task_client",
        "task_tasker",
        "task_title",
        "task_description",
        "task_budget",
        "task_created_at",
        "task_completed_at",
        "ip_address",
        "timestamp",
    )


@admin.register(TermsAcceptanceLog)
class TermsAcceptanceLogAdmin(admin.ModelAdmin):
    list_display = ("user", "accepted_version", "accepted_at", "ip_address")
    list_filter = ("accepted_version", "accepted_at")
    search_fields = ("user__username",)
    readonly_fields = (
        "user",
        "accepted_version",
        "accepted_at",
        "ip_address",
        "user_agent",
    )
