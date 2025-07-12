from django.contrib import admin

from api.models import TaskLog, TermsAcceptanceLog


@admin.register(TaskLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ("event_type", "user", "related_task", "timestamp")
    list_filter = ("event_type", "timestamp")
    search_fields = ("user__username", "details")


@admin.register(TermsAcceptanceLog)
class TermsAcceptanceLogAdmin(admin.ModelAdmin):
    list_display = ("user", "accepted_version", "accepted_at", "ip_address")
    list_filter = ("accepted_version", "accepted_at")
    search_fields = ("user__username",)
