from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import TaskRequestSerializer, TaskSerializer


def broadcast_taskfeed_new(task_instance: object):
    channel_layer = get_channel_layer()
    message = {
        "type": "task:new",  # the event type your frontend listens for
        "payload": TaskSerializer(task_instance).data,  # the actual task data
    }
    async_to_sync(channel_layer.group_send)(
        "taskfeed",
        {
            "type": "update",
            "data": message,
        },
    )


def broadcast_taskfeed_deleted(task_id: int):
    channel_layer = get_channel_layer()
    message = {
        "type": "task:delete",  # event type for deletion
        "payload": {"id": task_id},  # minimal data to identify which task was deleted
    }
    async_to_sync(channel_layer.group_send)(
        "taskfeed",
        {
            "type": "update",
            "data": message,
        },
    )


def get_user_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def broadcast_task_requests(task):
    channel_layer = get_channel_layer()
    group_name = f"task_request_{task.id}"
    message = {
        "type": "task:requests",
        "payload": task.requests,
    }

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "update",
            "data": message,
        },
    )


def broadcast_task_request(task_request):
    payload = TaskRequestSerializer(task_request).data
    group_name = f"task_request_{payload["task_id"]}"
    message = {
        "type": "task:requests-new",
        "payload": payload,
    }
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "update",
            "data": message,
        },
    )


def broadcast_task_request_deleted(task_id, tasker_id, task_request_id):
    group_name = f"task_request_{task_id}"
    message = {
        "type": "task:requests-delete",
        "payload": {
            "task_id": task_id,
            "tasker_id": tasker_id,
            "task_request_id": task_request_id,
            # task_request_id is the id of the actual request emmited by the server and
            # then client renders that in the UI using it as an id for the FlatList within InspectRequestModal
        },
    }
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "update",
            "data": message,
        },
    )
