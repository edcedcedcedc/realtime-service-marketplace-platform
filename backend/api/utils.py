from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import TaskSerializer


def taskfeed_broadcast_new(task_instance: object):
    channel_layer = get_channel_layer()
    message = {
        "type": "task:new",  # the event type your frontend listens for
        "payload": TaskSerializer(task_instance).data,  # the actual job data
    }
    async_to_sync(channel_layer.group_send)(
        "taskfeed",
        {
            "type": "update",
            "data": message,
        },
    )


def taskfeed_broadcast_deleted(task_id: int):
    channel_layer = get_channel_layer()
    message = {
        "type": "task:delete",  # event type for deletion
        "payload": {"id": task_id},  # minimal data to identify which job was deleted
    }
    async_to_sync(channel_layer.group_send)(
        "taskfeed",
        {
            "type": "update",  # reuse the same 'update' handler in consumer
            "data": message,
        },
    )
