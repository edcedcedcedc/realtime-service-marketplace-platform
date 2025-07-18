import time
from unittest.mock import MagicMock, patch
from uuid import uuid4
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.test import TestCase, TransactionTestCase, override_settings
from channels.layers import InMemoryChannelLayer, get_channel_layer
from api.utils import taskfeed_broadcast_new
from asgiref.sync import sync_to_async
import asyncio
import json
from channels.testing import WebsocketCommunicator
from api.models import Task
from config.asgi import application

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.user_data = {
            "email": f"{str(uuid4())}@gmail.com",
            "username": str(uuid4()),
            "password": str(uuid4()),
            "role": "client",
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(username=self.user_data["username"]).exists()
        )

    def test_user_login(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(
            self.login_url,
            {
                "username": self.user_data["username"],
                "password": self.user_data["password"],
            },
        )
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_register_existing_username(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)


class TaskTests(AuthTests):
    def setUp(self):
        super().setUp()
        self.tasks_url = reverse("task-create")
        self.task_data = {
            "title": "Fix my sink",
            "description": "It's leaking.",
            "budget": "100.00",
            "location": "Chișinău",
            "status": "open",
        }

    def authenticate(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.login_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_task_post(self):
        self.authenticate()
        response = self.client.post(self.tasks_url, self.task_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], self.task_data["title"])
        self.assertEqual(response.data["client_username"], self.user_data["username"])

        response_after_first_post = self.client.post(self.tasks_url, self.task_data)
        response_after_second_post = self.client.post(self.tasks_url, self.task_data)
        self.assertEqual(response_after_first_post.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response_after_second_post.status_code, status.HTTP_201_CREATED
        )
        self.assertNotEqual(
            response_after_second_post.data["created_at"],
            response_after_first_post.data["created_at"],
        )

    def test_task_patch(self):
        self.authenticate()

        response = self.client.post(self.tasks_url, self.task_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        task_id = response.data["id"]

        patch_data = {
            "status": "in-progress",
            "budget": "150.00",
        }

        update_url = reverse("task-update", kwargs={"id": task_id})

        response = self.client.patch(update_url, patch_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], patch_data["status"])
        self.assertEqual(str(response.data["budget"]), patch_data["budget"])

        response_after = self.client.patch(update_url, patch_data, format="json")
        self.assertEqual(response_after.data["created_at"], response.data["created_at"])

        ########################################
        # JOB.created_at and JOB.updated_at
        #########################################
        created_at_before = response.data["created_at"]
        updated_at_before = response.data["updated_at"]

        time.sleep(2)

        patch_data = {
            "status": "in-progress",
            "budget": "250.00",
        }
        update_url = reverse("task-update", kwargs={"id": task_id})
        response_after = self.client.patch(update_url, patch_data, format="json")
        self.assertEqual(response_after.status_code, status.HTTP_200_OK)

        created_at_after = response_after.data["created_at"]
        updated_at_after = response_after.data["updated_at"]

        self.assertEqual(created_at_before, created_at_after)
        self.assertNotEqual(updated_at_before, updated_at_after)


class TaskBroadcastIntegrationTests(TransactionTestCase):
    reset_sequences = True

    async def test_task_broadcast_received(self):

        user = await sync_to_async(User.objects.create_user)(
            username="john", password="pass"
        )
        task = await sync_to_async(Task.objects.create)(
            title="Test task",
            description="Task desc",
            budget=100,
            location="Chișinău",
            status="open",
            client=user,
        )

        communicator = WebsocketCommunicator(application, "/ws/tasks/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected, "Failed to connect to WebSocket")

        await sync_to_async(taskfeed_broadcast_new)(task)

        response = await communicator.receive_from()
        data = json.loads(response)
        print(data, "data")
        self.assertEqual(data["payload"]["title"], task.title)
        self.assertEqual(data["payload"]["description"], task.description)
        self.assertEqual(data["payload"]["status"], task.status)

        await communicator.disconnect()
