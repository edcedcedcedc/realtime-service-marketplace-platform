from unittest.mock import MagicMock, patch
from uuid import uuid4
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.test import TestCase, TransactionTestCase, override_settings
from channels.layers import InMemoryChannelLayer, get_channel_layer
from api.utils import jobsfeed_broadcast
from asgiref.sync import sync_to_async
import asyncio
import json
from channels.testing import WebsocketCommunicator
from api.models import Job
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


class JobTests(AuthTests):
    def setUp(self):
        super().setUp()
        self.jobs_url = reverse("job-create")
        self.job_data = {
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

    def test_job_post(self):
        self.authenticate()
        response = self.client.post(self.jobs_url, self.job_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], self.job_data["title"])
        self.assertEqual(response.data["client_username"], self.user_data["username"])

    def test_job_patch(self):
        self.authenticate()

        create_response = self.client.post(self.jobs_url, self.job_data)
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        job_id = create_response.data["id"]

        # New data to patch
        patch_data = {
            "status": "in-progress",
            "budget": "150.00",
        }

        update_url = reverse("job-update", kwargs={"id": job_id})
        patch_response = self.client.patch(update_url, patch_data, format="json")

        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data["status"], patch_data["status"])
        self.assertEqual(str(patch_response.data["budget"]), patch_data["budget"])


class JobBroadcastIntegrationTests(TransactionTestCase):
    reset_sequences = True

    async def test_job_broadcast_received(self):

        user = await sync_to_async(User.objects.create_user)(
            username="john", password="pass"
        )
        job = await sync_to_async(Job.objects.create)(
            title="Test job",
            description="Job desc",
            budget=100,
            location="Chișinău",
            status="open",
            client=user,
        )

        communicator = WebsocketCommunicator(application, "/ws/jobs/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected, "Failed to connect to WebSocket")

        await sync_to_async(jobsfeed_broadcast)(job)

        response = await communicator.receive_from()
        data = json.loads(response)
        print(data)
        self.assertEqual(data["title"], job.title)
        self.assertEqual(data["description"], job.description)
        self.assertEqual(data["status"], job.status)

        await communicator.disconnect()
