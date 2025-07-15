from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/tasks/$", consumers.TaskFeedConsumer.as_asgi()),
    re_path(
        r"ws/task-requests/(?P<task_id>\d+)/$", consumers.TaskRequestsConsumer.as_asgi()
    ),
]
