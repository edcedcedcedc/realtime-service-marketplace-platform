# api/tasks.py
from api.utils import taskfeed_broadcast_deleted
from .models import Task
from celery import shared_task
from django.utils import timezone
from datetime import timedelta


from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task
def delete_task_if_still_open(task_id):
    logger.info(f"Task started for task {task_id}")
    try:
        task = Task.objects.get(pk=task_id)
        logger.info(f"Task {task_id} status is '{task.status}'")
        if task.status == "open":
            task.delete()
            logger.info(f"Task {task_id} deleted because it was open.")
            taskfeed_broadcast_deleted(task_id)
        else:
            logger.info(f"Task {task_id} NOT deleted because status is '{task.status}'")
    except Task.DoesNotExist:
        logger.info(f"Task {task_id} does not exist (already deleted?)")


@shared_task
def delete_expired_tasks():
    expiration_time = timezone.now() - timedelta(seconds=300)
    deleted_count, _ = Task.objects.filter(
        created_at__lt=expiration_time, status="open"
    ).delete()
    print(f"Deleted {deleted_count} expired tasks")
