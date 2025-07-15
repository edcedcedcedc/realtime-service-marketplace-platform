from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (
    ClientProfileSerializer,
    TaskRequestSerializer,
    TaskSerializer,
    TaskerProfileSerializer,
)
from .models import TaskLog, Task, TaskRequest, TermsAcceptanceLog, Profile
from .broadcast import (
    broadcast_task_request,
    broadcast_task_request_deleted,
    broadcast_taskfeed_new,
    broadcast_taskfeed_deleted,
    get_user_ip,
)
from api.tasks import delete_task_if_still_open


User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get("email")
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")

    if not email or not password or not role or not username:
        return Response(
            {"error": "All fields (email, username, password, role) are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST
        )

    if role not in ["tasker", "client"]:
        return Response(
            {"error": "Role must be tasker or client."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=username, password=password, email=email, role=role
    )
    Profile.objects.create(user=user)
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                },
            },
            status=status.HTTP_202_ACCEPTED,
        )
    else:
        return Response(
            {"error": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    if request.method == "POST":
        return Response({"message": "POST received this is a protected endpoint"})
    return Response({"message": "GET received this is a protected endpoint"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_terms(request):
    user = request.user
    version = request.data.get("version", settings.CURRENT_TSC_VERSION)
    user_agent = request.META.get("HTTP_USER_AGENT", "")
    ip = get_user_ip(request)

    TermsAcceptanceLog.objects.create(
        user=user,
        accepted_version=version,
        ip_address=ip,
        user_agent=user_agent,
    )
    return Response({"message": "Terms accepted"}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def current_tsc_text(request):
    return Response({"tsc": settings.CURRENT_TSC_TEXT})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def task_create(request):

    if getattr(request.user, "role", None) != "client":
        return Response(
            {"error": "Only clients can create tasks."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = TaskSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        try:
            terms_log = TermsAcceptanceLog.objects.filter(user=request.user).latest(
                "accepted_at"
            )
        except TermsAcceptanceLog.DoesNotExist:
            return Response(
                {
                    "error": "Terms and Conditions must be accepted before creating a task."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        task_instance = serializer.save(
            client=request.user, terms_accepted_client_at=terms_log
        )

        TaskLog.objects.create(
            user=request.user,
            event_type="tasks_created",
            related_task=task_instance,
            terms_accepted_client_at=terms_log,
            task_client=task_instance.client,
            task_tasker=task_instance.tasker,
            task_title=task_instance.title,
            task_description=task_instance.description,
            task_budget=task_instance.budget,
            task_created_at=task_instance.created_at,
            task_completed_at=task_instance.completed_at,
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        broadcast_taskfeed_new(task_instance)

        re_serializer = TaskSerializer(task_instance)

        delete_task_if_still_open.apply_async(args=[task_instance.id], countdown=300)
        return Response(re_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def task_delete(request, id):
    try:
        task = Task.objects.get(pk=id)
    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    if task.client != request.user:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )
    task_id = task.id
    broadcast_taskfeed_deleted(task_id)
    # broadcast_task_request_deleted(task_id)
    task.delete()
    return Response({"message": "Task deleted successfully"}, status=status.HTTP_200_OK)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def task_update(request, id):
    try:
        task_instance = Task.objects.get(pk=id)
    except Task.DoesNotExist:
        return Response(
            {"error": "Task doesn't exist"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.user != task_instance.client:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )

    serializer = TaskSerializer(
        task_instance, data=request.data, partial=True, context={"request": request}
    )
    if serializer.is_valid():
        updated_task_instance = serializer.save()
        broadcast_taskfeed_new(updated_task_instance)
        re_serializer = TaskSerializer(updated_task_instance)
        return Response(re_serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def task_detail(request, id):
    try:
        task = Task.objects.get(pk=id)
        serializer = TaskSerializer(task)
        return Response(serializer.data, status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def open_tasks(request):
    tasks = Task.objects.filter(status="open").order_by("-id")
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def in_progress_tasks(request):
    tasks = Task.objects.filter(status="in-progress").order_by("-id")
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def completed_tasks(request):
    tasks = Task.objects.filter(status="completed").order_by("-id")
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def all_tasks(request):
    tasks = Task.objects.all().order_by("-id")
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_detail_update(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.user.role == "tasker":
        SerializerClass = TaskerProfileSerializer
    else:
        SerializerClass = ClientProfileSerializer

    if request.method == "GET":
        serializer = SerializerClass(profile)
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = SerializerClass(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def task_request(request):  # as tasker
    task_id = request.data.get("task_id")

    try:
        task = Task.objects.get(id=task_id, status="open")
        if task.client == request.user:
            return Response(
                {"error": "You cannot accept your own task."},
                status=status.HTTP_403_FORBIDDEN,
            )

        existing_request = TaskRequest.objects.filter(
            task=task, tasker=request.user
        ).first()
        if existing_request:
            return Response(
                {"error": "You already sent a request for this task."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    except Task.DoesNotExist:
        return Response(
            {"error": "Task not found or closed."}, status=status.HTTP_404_NOT_FOUND
        )

    task_request = TaskRequest.objects.create(task=task, tasker=request.user)

    broadcast_task_request(task_request)

    return Response({"message": "Request sent"}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_task_request(request):  # as tasker
    task_id = request.data.get("task_id")

    try:
        task = Task.objects.get(id=task_id)
        task_request = TaskRequest.objects.get(task=task, tasker=request.user)
    except (Task.DoesNotExist, TaskRequest.DoesNotExist):
        return Response(
            {"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND
        )
    task_request_id = task_request.id
    task_request.delete()

    broadcast_task_request_deleted(task.id, request.user.id, task_request_id)

    return Response({"message": "Request withdrawn."}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_task_requests_for_task(request, task_id):  # as client
    try:
        task = Task.objects.get(id=task_id)
        if task.client != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    task_requests = TaskRequest.objects.filter(task=task).order_by("-created_at")
    serializer = TaskRequestSerializer(task_requests, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_tasker(request):
    task_id = request.data.get("task_id")
    tasker_id = request.data.get("tasker_id")
    try:
        task = Task.objects.get(id=task_id)
        tasker = User.objects.get(id=tasker_id)

    except (Task.DoesNotExist, User.DoesNotExist):
        return Response(
            {"error": "Task or user not found"}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        terms_log = TermsAcceptanceLog.objects.filter(id=tasker_id).latest(
            "accepted_at"
        )
    except TermsAcceptanceLog.DoesNotExist:
        return Response(
            {"error": "Terms and Conditions must be accepted before creating a task."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if task.client != request.user:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    task.tasker = tasker
    task.terms_accepted_tasker_at = terms_log
    task.status = "in-progress"
    task.save()

    # Remove all other TaskRequests ???
    TaskRequest.objects.filter(task=task).exclude(tasker=tasker).delete()

    serializer = TaskSerializer(task, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)
