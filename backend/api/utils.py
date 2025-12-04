from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import TaskRequestSerializer, TaskSerializer
from django.utils.timezone import now


def broadcast_taskfeed_new(task_instance: object):
    channel_layer = get_channel_layer()
    group_name = "taskfeed"
    message = {
        "type": "task:new",  # the event type your frontend listens for
        "payload": TaskSerializer(task_instance).data,  # the actual task data
    }
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "update",
            "data": message,
        },
    )


def broadcast_taskfeed_deleted(task_id: int):
    channel_layer = get_channel_layer()
    group_name = "taskfeed"
    message = {
        "type": "task:delete",  # event type for deletion
        "payload": {"id": task_id},  # minimal data to identify which task was deleted
    }
    async_to_sync(channel_layer.group_send)(
        group_name,
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
    group_name = f"taskrequest_{task.id}"
    message = {
        "type": "taskrequests:newall",
        "payload": task.requests,
    }

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "update",
            "data": message,
        },
    )


def broadcast_task_request_new(task_request, client_id):
    payload = TaskRequestSerializer(task_request).data
    payload["client_id"] = client_id
    payload["action"] = {"tasker": "", "client": ""}
    group_name = f"taskrequest_{payload['task_id']}"
    message = {
        "type": "taskrequest:new",
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


def broadcast_task_request_deleted(
    subtype: str,
    action: any,
    task_id: any,
    tasker_id: any,
    client_id: any,
    task_request_id: any,
):
    group_name = f"taskrequest_{task_id}"
    message = {
        "type": subtype,
        "payload": {
            "action": action,
            "task_id": task_id,
            "tasker_id": tasker_id,
            "client_id": client_id,
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


def notify_user(user_id, subtype, data):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    channel_layer = get_channel_layer()
    group_name = f"user_{user_id}"

    message = {
        "type": subtype,
        "timestamp": now().isoformat(),
        "payload": data,
    }

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "notify",
            "data": message,
        },
    )
