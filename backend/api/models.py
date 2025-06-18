from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Extend as needed (e.g., add is_worker, is_client flags)
    is_worker = models.BooleanField(default=False)
    is_client = models.BooleanField(default=False)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    rating = models.FloatField(default=0)
    # Add more fields as needed

    def __str__(self):
        return f"{self.user.username}'s profile"


class Job(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    suggested_budget = models.DecimalField(max_digits=10, decimal_places=2)
    accept_bids = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

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
