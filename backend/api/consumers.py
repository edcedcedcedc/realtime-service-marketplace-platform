import json
from channels.generic.websocket import AsyncWebsocketConsumer


class JobFeedConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("jobs", self.channel_name)
        await self.accept()
        print("Client connected to jobs feed.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("jobs", self.channel_name)

    async def receive(self, text_data):
        pass

    async def jobfeed_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
