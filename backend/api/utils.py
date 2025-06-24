from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import JobSerializer


def jobsfeed_broadcast(job_instance):
    channel_layer = get_channel_layer()
    data = JobSerializer(job_instance).data
    async_to_sync(channel_layer.group_send)(
        "jobsfeed",
        {
            "type": "jobsfeed_update",
            "data": data,
        },
    )
