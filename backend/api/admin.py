from django.contrib import admin
from api.models import TaskLog, TermsAcceptanceLog


@admin.register(TaskLog)
class TaskLogAdmin(admin.ModelAdmin):
    list_display = (
        "event_type",
        "user",
        "related_task",
        "client",
        "tasker",
        "title",
        "budget",
        "timestamp",
        "ip_address",
    )
    list_filter = ("event_type", "timestamp", "client", "tasker")
    search_fields = (
        "user__username",
        "client__username",
        "tasker__username",
        "title",
        "description",
    )
    readonly_fields = (
        "user",
        "event_type",
        "related_task",
        "client",
        "tasker",
        "title",
        "description",
        "budget",
        "created_at",
        "completed_at",
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
