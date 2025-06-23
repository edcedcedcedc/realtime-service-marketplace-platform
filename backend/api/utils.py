from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import JobSerializer


def broadcast_jobfeed_update(job_instance):
    channel_layer = get_channel_layer()
    data = JobSerializer(job_instance).data
    async_to_sync(channel_layer.group_send)(
        "jobs",
        {
            "type": "jobfeed_update",
            "data": data,
        },
    )
