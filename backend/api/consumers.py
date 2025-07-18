import json
from channels.generic.websocket import AsyncWebsocketConsumer


class TaskFeedConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close()
            return

        await self.channel_layer.group_add("taskfeed", self.channel_name)
        await self.accept()
        print(f"[TaskFeed] {user} connected.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("taskfeed", self.channel_name)
        print(f"[TaskFeed] Disconnected user: {self.scope['user']}")

    async def update(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def receive(self, text_data):
        pass  # no incoming messages expected


class TaskRequestsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.task_id = self.scope["url_route"]["kwargs"]["task_id"]
        self.group_name = f"taskrequest_{self.task_id}"
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"[TaskRequest:{self.task_id}] {user} connected.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print(f"[TaskRequest:{self.task_id}] Disconnected user: {self.scope['user']}")

    async def update(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def receive(self, text_data):
        pass


class UserNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
        else:
            self.group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            print(f"[Notifications: {self.user.username}]  connected.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print(f"[Notifications: {self.user.username}] disconnected.")

    async def notify(self, event):
        await self.send(text_data=json.dumps(event["data"]))


from channels.db import database_sync_to_async
import json


class TaskChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.task_id = self.scope["url_route"]["kwargs"]["task_id"]
        self.group_name = f"taskchat_{self.task_id}"
        from django.contrib.auth.models import AnonymousUser

        user = self.scope["user"]
        if user == AnonymousUser():
            await self.close()
            return

        is_participant = await self.is_task_participant(user, self.task_id)
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "")

        user = self.scope["user"]
        await self.save_message(user, self.task_id, message)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "message": message,
                "user_id": user.id,
                "username": user.username,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "user_id": event["user_id"],
                    "username": event["username"],
                }
            )
        )

    @database_sync_to_async
    def is_task_participant(self, user, task_id):
        from .models import Task

        try:
            task = Task.objects.get(id=task_id)
            return user == task.client or user == task.tasker
        except Task.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, user, task_id, message):
        from .models import TaskChatMessage
        from .models import Task

        task = Task.objects.get(id=task_id)
        return TaskChatMessage.objects.create(
            task=task,
            sender=user,
            content=message,
        )
