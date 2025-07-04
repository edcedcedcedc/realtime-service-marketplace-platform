from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import JobSerializer


def jobsfeed_broadcast(job_instance):
    channel_layer = get_channel_layer()
    message = {
        "type": "job:new",  # the event type your frontend listens for
        "payload": JobSerializer(job_instance).data,  # the actual job data
    }
    async_to_sync(channel_layer.group_send)(
        "jobfeed",
        {
            "type": "update",
            "data": message,
        },
    )


def jobsfeed_broadcast_deleted(job_id):
    channel_layer = get_channel_layer()
    message = {
        "type": "job:deleted",  # event type for deletion
        "payload": {"id": job_id},  # minimal data to identify which job was deleted
    }
    async_to_sync(channel_layer.group_send)(
        "jobfeed",
        {
            "type": "update",  # reuse the same 'update' handler in consumer
            "data": message,
        },
    )
