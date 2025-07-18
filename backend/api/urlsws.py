from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/taskfeed/$", consumers.TaskFeedConsumer.as_asgi()),
    re_path(
        r"ws/taskrequest/(?P<task_id>\d+)/$", consumers.TaskRequestsConsumer.as_asgi()
    ),
    re_path(r"ws/notifications/$", consumers.UserNotificationConsumer.as_asgi()),
    re_path(r"ws/taskchat/(?P<task_id>\d+)/$", consumers.TaskChatConsumer.as_asgi()),
]
