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
