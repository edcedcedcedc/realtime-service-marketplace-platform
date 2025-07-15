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


def broadcast_task_request(task, tasker, eta):
    profile = getattr(tasker, "profile", None)
    payload = {
        "task_id": task.id,
        "tasker_id": tasker.id,
        "tasker_username": tasker.username,
        "tasker_name": getattr(profile, "name", ""),
        "tasker_family_name": getattr(profile, "family_name", ""),
        "rating": getattr(profile, "rating", None),
        "specialization": getattr(profile, "category", ""),
        "tasks_done": getattr(profile, "tasks_done", 0),
        "eta": eta,
    }

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"task_request_{task.id}",
        {
            "type": "update",
            "data": {
                "type": "task:requests",
                "payload": payload,
            },
        },
    )
