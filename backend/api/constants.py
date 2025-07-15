CATEGORY_CHOICES = [
    ("repair", "Fix & Repair"),
    ("personal_help", "Personal Help"),
    ("delivery", "Move & Deliver"),
    ("other", "Other"),
]
EVENT_CHOICES = [
    ("tasks_created", "Tasks Created"),
    ("tasks_completed", "Tasks Completed"),
    ("tasks_cancelled", "Tasks Cancelled"),
    ("user_login", "User Login"),
    ("terms_accepted_client_at", "Terms Accepted By Client"),
]
STATUS_CHOICES = [
    ("open", "Open"),
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
