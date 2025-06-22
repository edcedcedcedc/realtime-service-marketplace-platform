from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser


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
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    cancelled = models.BooleanField(default=False)

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
