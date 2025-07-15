import json
from channels.generic.websocket import AsyncWebsocketConsumer


class TaskFeedConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("taskfeed", self.channel_name)
        await self.accept()
        print("Client connected to task feed.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("taskfeed", self.channel_name)

    async def receive(self, text_data):
        pass

    async def update(self, event):
        await self.send(text_data=json.dumps(event["data"]))


class TaskRequestsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.task_id = self.scope["url_route"]["kwargs"]["task_id"]
        self.group_name = f"task_request_{self.task_id}"
        print(f"Client connected to task with id ${self.task_id}")
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass

    async def update(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def receive_json(self, content):
        if content["type"] == "task:join":
            task_id = content["payload"]["task_id"]
            await self.channel_layer.group_add(
                f"task_request_{task_id}", self.channel_name
            )
