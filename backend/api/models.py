from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.exceptions import ValidationError


class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=[("worker", "Worker"), ("client", "Client")],
        default="client",
    )

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    bio = models.TextField(blank=True)
    rating = models.FloatField(default=0)

    def __str__(self):
        return f"{self.user.username}'s profile"


class Job(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("confirmed", "Confirmed"),
        ("in-progress", "In-Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
    ]
    URGENCY_CHOICES = [
        ("now", "Now - 5 minutes"),
        ("soon", "Soon - 30 minutes"),
        ("flexible", "Later - 1 hour"),
    ]

    CATEGORY_CHOICES = [
        ("repair", "Fix & Repair"),
        ("personal_help", "Personal Help"),
        ("delivery", "Move & Deliver"),
    ]

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

    # Relations
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="jobs_posted",
    )
    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="jobs_taken",
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
        default=list, blank=True, help_text="List of photo URLs related to the job"
    )

    def clean(self):
        super().clean()
        SUBCATEGORY_CHOICES = {
            "repair": ["electrical", "plumbing", "appliance", "furniture"],
            "personal_help": [
                "dog_walking",
                "grocery_pickup",
                "waiting_line",
                "elderly_help",
            ],
            "delivery": ["package_delivery", "furniture_moving", "heavy_lifting"],
        }
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


class Bid(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="bids")
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Bid by {self.worker.username} on {self.job.title}"


class Rating(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="ratings")
    worker = models.ForeignKey(
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
