# api/tasks.py
from api.utils import jobsfeed_broadcast_deleted
from .models import Job
from celery import shared_task
from django.utils import timezone
from datetime import timedelta


from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task
def delete_job_if_still_open(job_id):
    logger.info(f"Task started for job {job_id}")
    try:
        job = Job.objects.get(pk=job_id)
        logger.info(f"Job {job_id} status is '{job.status}'")
        if job.status == "open":
            job.delete()
            logger.info(f"Job {job_id} deleted because it was open.")
            jobsfeed_broadcast_deleted(job_id)
        else:
            logger.info(f"Job {job_id} NOT deleted because status is '{job.status}'")
    except Job.DoesNotExist:
        logger.info(f"Job {job_id} does not exist (already deleted?)")


@shared_task
def delete_expired_jobs():
    expiration_time = timezone.now() - timedelta(seconds=300)
    deleted_count, _ = Job.objects.filter(
        created_at__lt=expiration_time, status="open"
    ).delete()
    print(f"Deleted {deleted_count} expired jobs")
