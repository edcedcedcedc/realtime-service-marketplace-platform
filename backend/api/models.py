from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.exceptions import ValidationError
from .constants import (
    CATEGORY_CHOICES,
    EVENT_CHOICES,
    STATUS_CHOICES,
    SUBCATEGORY_CHOICES,
    URGENCY_CHOICES,
)


class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=[("tasker", "Tasker"), ("client", "Client")],
        default="client",
    )

    def __str__(self):
        return self.username

    @property
    def latest_terms_acceptance(self):
        return self.terms_logs.order_by("-accepted_at").first()


class TermsAcceptanceLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tsc_logs")
    accepted_at = models.DateTimeField(auto_now_add=True)
    accepted_version = models.CharField(
        max_length=20, default=settings.CURRENT_TSC_VERSION
    )
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} accepted {self.accepted_version} at {self.accepted_at}"


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    name = models.CharField(max_length=150, blank=True)
    family_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)

    rating = models.FloatField(default=0)
    tasks_done = models.PositiveIntegerField(default=0)
    tasks_posted = models.PositiveBigIntegerField(default=0)

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default="repair",
        blank=True,
    )

    eta = models.IntegerField(blank=False, default=0)

    def __str__(self):
        return f"Profile of {self.user.username}"

    @property
    def id(self):
        return self.user.id

    @property
    def username(self):
        return self.user.username

    @property
    def email(self):
        return self.user.email

    @property
    def role(self):
        return self.user.role


class Task(models.Model):

    # Main fields
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    material_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        blank=True,
        null=True,
        help_text="Extra cost for parts/materials, if applicable",
    )
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default="now")
    scheduled_for = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Specific date and time the task is scheduled for",
    )
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    must_start_by = models.DateTimeField(null=True, blank=True)
    expires_from_feed = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    requests = models.JSONField(
        default=list,
        blank=True,
        help_text="List of incoming tasker requests with tasker ID, rating, ETA, etc.",
    )

    # Relations
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks_posted",
        blank=True,
        null=True,  # related name within client object
    )
    tasker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="tasks_taken",  # related name within tasker object
        null=True,
        blank=True,
    )
    terms_accepted_client_at = models.ForeignKey(
        TermsAcceptanceLog,
        on_delete=models.SET_NULL,
        related_name="tasks_as_client",
        null=True,
        blank=True,
    )
    terms_accepted_tasker_at = models.ForeignKey(
        TermsAcceptanceLog,
        on_delete=models.SET_NULL,
        related_name="tasks_as_tasker",
        null=True,
        blank=True,
    )
    # New fields
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        null=True,
        blank=True,
        default=None,
    )
    subcategory = models.CharField(
        max_length=50, blank=True, help_text="Subcategory or specific task type"
    )
    photo_urls = models.JSONField(
        default=list, blank=True, help_text="List of photo URLs related to the task"
    )

    def clean(self):
        super().clean()

        if self.subcategory:
            valid_subcats = SUBCATEGORY_CHOICES.get(self.category, [])
            if self.subcategory not in valid_subcats:
                raise ValidationError(
                    {
                        "subcategory": f"Subcategory '{self.subcategory}' is invalid for category '{self.category}'."
                    }
                )
        if not self.urgency and not self.scheduled_for:
            raise ValidationError("Either 'urgency' or 'scheduled_for' must be set.")

        if self.urgency and self.scheduled_for:
            raise ValidationError(
                "Only one of 'urgency' or 'scheduled_for' can be set, not both."
            )

    def __str__(self):
        return self.title


class Subtask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="subtasks")
    title = models.CharField(max_length=255)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    tasker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subtasks_taken",
    )
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Bid(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="bids")
    tasker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Bid by {self.tasker.username} on {self.task.title}"


class Rating(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="ratings")
    tasker = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="worker_ratings"
    )
    client = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="client_ratings"
    )
    score = models.PositiveSmallIntegerField()
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Rating {self.score} for {self.worker.username} by {self.client.username}"
        )


class TaskLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    related_task = models.ForeignKey(
        "Task", null=True, blank=True, on_delete=models.SET_NULL
    )
    terms_accepted_client_at = models.ForeignKey(
        "TermsAcceptanceLog",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasklogs_terms_client",
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="tasklogs_as_client",
    )
    tasker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="tasklogs_as_tasker",
    )
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.event_type} at {self.timestamp}"

    def save(self, *args, **kwargs):
        if self.related_task:
            self.client = self.related_task.client
            self.tasker = self.related_task.tasker
            self.title = self.related_task.title
            self.description = self.related_task.description
            self.budget = self.related_task.budget
            self.created_at = self.related_task.created_at
            self.completed_at = self.related_task.completed_at
        super().save(*args, **kwargs)


class TaskRequest(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    tasker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_requests_taken",
        null=True,
        blank=True,
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_requests_posted",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)


class TaskChatMessage(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sent_at"]
