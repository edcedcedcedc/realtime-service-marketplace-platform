from django.conf import settings
from django.dispatch import receiver
from django.shortcuts import get_object_or_404
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
from .models import (
    TaskChatMessage,
    TaskLog,
    Task,
    TaskRequest,
    TermsAcceptanceLog,
    Profile,
)
from .utils import (
    broadcast_task_request,
    broadcast_taskfeed_new,
    broadcast_taskfeed_deleted,
    get_user_ip,
    notify_user,
)
from api.tasks import delete_task_if_still_open
from django.db.models.signals import post_delete


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
            client=request.user,
            terms_accepted_client_at=terms_log,
        )

        # Log task creation
        TaskLog.objects.create(
            user=request.user,
            event_type="tasks_created",
            related_task=task_instance,
            terms_accepted_client_at=terms_log,
            client=task_instance.client,
            tasker=task_instance.tasker,
            title=task_instance.title,
            description=task_instance.description,
            budget=task_instance.budget,
            created_at=task_instance.created_at,
            completed_at=task_instance.completed_at,
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        broadcast_taskfeed_new(task_instance)
        all_taskers = User.objects.filter(role="tasker")
        for tasker in all_taskers:
            notify_user(
                tasker.id,
                "notify:task-new",
                {
                    "task_id": task_instance.id,
                    "title": task_instance.title,
                    "budget": float(task_instance.budget),
                    "urgency": task_instance.urgency,
                    "location": {
                        "lat": float(task_instance.latitude),
                        "lng": float(task_instance.longitude),
                    },
                },
            )

        # Delay cleanup if no taskers accept
        delete_task_if_still_open.apply_async(args=[task_instance.id], countdown=300)

        return Response(
            TaskSerializer(task_instance).data, status=status.HTTP_201_CREATED
        )

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
def initiate_task_request_as_tasker(request):
    task_id = request.data.get("task_id")

    try:
        task = Task.objects.get(id=task_id, status="open")
    except Task.DoesNotExist:
        return Response(
            {"error": "Task not found or closed."}, status=status.HTTP_404_NOT_FOUND
        )

    if task.client == request.user:
        return Response(
            {"error": "You cannot accept your own task."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if TaskRequest.objects.filter(task=task, tasker=request.user).exists():
        return Response(
            {"error": "You already sent a request for this task."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    task_request = TaskRequest.objects.create(task=task, tasker=request.user)

    """ notify_user(
        task.client.id,
        "notify:taskrequest-initiate-by-tasker",
        {
            "task_id": task.id,
            "client_id": task.client.id,
            "action": "add_tasker_to_taskrequests",
        },
    ) """
    broadcast_task_request(
        "initiate-by-tasker", {"tasker": "", "client": ""}, task_request
    )

    return Response({"message": "Request sent."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_task_request_as_tasker(request):
    task_id = request.data.get("task_id")

    try:
        task = Task.objects.get(id=task_id)
        task_request = TaskRequest.objects.get(task=task, tasker=request.user)
    except (Task.DoesNotExist, TaskRequest.DoesNotExist):
        return Response(
            {"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND
        )
    """  notify_user(
        task.client.id,
        "notify:taskrequest-cancelled-by-tasker",
        {
            "task_id": task.id,
            "client_id": task.client.id,
            "task_request_id": task_request_id,
            "action": "delete_tasker_from_taskrequests",
        },
    ) """
    broadcast_task_request(
        "cancelled-by-tasker", {"tasker": "", "client": ""}, task_request
    )
    task_request.delete()
    return Response({"message": "Request withdrawn."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_task_request_as_client(request):
    task_id = request.data.get("task_id")
    tasker_id = request.data.get("tasker_id")

    try:
        task = Task.objects.get(id=task_id)
        task_request = TaskRequest.objects.get(task=task, tasker=tasker_id)
    except (Task.DoesNotExist, TaskRequest.DoesNotExist):
        return Response(
            {"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND
        )

    broadcast_task_request(
        "cancelled-by-client",
        {"tasker": "close_modal", "client": "delete_tasker_from_taskrequests"},
        task_request,
    )
    task_request.delete()
    return Response({"message": "Request withdrawn."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_task_request_as_client(request):
    task_id = request.data.get("task_id")
    tasker_id = request.data.get("tasker_id")

    try:
        task = Task.objects.get(id=task_id)
        tasker = User.objects.get(id=tasker_id)
    except (Task.DoesNotExist, User.DoesNotExist):
        return Response(
            {"error": "Task or user not found."}, status=status.HTTP_404_NOT_FOUND
        )

    if task.status == "accepted":
        return Response(
            {"error": "Task already accepted by another tasker."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if task.client != request.user:
        return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

    try:
        task_request = TaskRequest.objects.get(task=task, tasker=tasker)
    except TaskRequest.DoesNotExist:
        return Response(
            {"error": "Tasker did not request this task."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        terms_log = TermsAcceptanceLog.objects.filter(user=tasker).latest("accepted_at")
    except TermsAcceptanceLog.DoesNotExist:
        return Response(
            {"error": "Terms and Conditions must be accepted before accepting a task."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    task.tasker = tasker
    task.terms_accepted_tasker_at = terms_log
    task.status = "accepted"
    task.save()

    other_requests = TaskRequest.objects.filter(task=task).exclude(tasker=tasker)
    for other_request in other_requests:
        try:
            broadcast_task_request(
                subtype="cancelled-by-client",
                action={
                    "tasker": "close_modal",
                    "client": "delete_tasker_from_taskrequests",
                },
                task_request=other_request,
            )
            other_request.delete()
        except Exception as e:
            print(
                f"[!] Failed to broadcast/delete request for tasker {other_request.tasker.id}: {str(e)}"
            )

    """     notify_user(
        tasker.id,
        "notify:taskrequest-request-to-confirm",
        {
            "task_id": task.id,
            "client_username": request.user.username,
            "client_id": request.user.id,
            "action": "tasker_needs_to_confirm",
        },
    ) """

    broadcast_task_request(
        subtype="accepted-by-client",
        action={
            "tasker": "payment_system",
            "client": "payment_system",
        },
        task_request=task_request,
    )

    """    notify_user(
        request.user.id,
        "notify:taskrequest-request-to-confirm",
        {
            "task_id": task.id,
            "tasker": tasker.username,
            "tasker_id": tasker.id,
            "action": "await_tasker_confirmation",
        },
    ) """

    serializer = TaskSerializer(task, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_all_task_requests_as_client(request):
    task_id = request.data.get("task_id")

    if not task_id:
        return Response(
            {"error": "Task ID is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    if task.client != request.user:
        return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

    task_requests = TaskRequest.objects.filter(task=task)

    cancelled_count = 0
    for tr in task_requests:
        try:
            broadcast_task_request(
                subtype="cancelled-by-client",
                action={
                    "tasker": "close_modal",
                    "client": "delete_tasker_from_taskrequests",
                },
                task_request=tr,
            )
            tr.delete()
            cancelled_count += 1
        except Exception as e:
            print(f"[!] Error cancelling TaskRequest {tr.id}: {e}")

    return Response(
        {"message": f"Cancelled {cancelled_count} task request(s)."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def task_requests_for_task_as_client(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    if task.client != request.user:
        return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

    task_requests = TaskRequest.objects.filter(task=task).order_by("-created_at")
    serializer = TaskRequestSerializer(task_requests, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_task_request_as_tasker(request):
    task_id = request.data.get("task_id")

    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    if task.tasker != request.user:
        return Response(
            {"error": "You are not assigned to this task."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if task.status != "accepted":
        return Response(
            {"error": "Invalid task state."}, status=status.HTTP_400_BAD_REQUEST
        )

    task.status = "confirmed"
    task.tasker = request.user
    task.save()

    try:
        task_request = TaskRequest.objects.get(task=task, tasker=request.user)
    except TaskRequest.DoesNotExist:
        return Response(
            {"error": "Couldn't find the tasker within this task_request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    task_request.delete()

    broadcast_task_request_deleted(
        subtype="taskrequest:confirmed-by-tasker",
        action={
            "tasker": "await_client_initiate_payment",
            "client": "initiate_payment_and_delete_modal",
        },
        task_id=task.id,
        tasker_id=request.user.id,
        client_id=task.client.id,
        task_request_id=task_request.id,
    )

    notify_user(
        task.client.id,
        "taskrequest:confirmed",
        {
            "task_id": task.id,
            "tasker": request.user.username,
            "tasker_id": request.user.id,
            "client_id": task.client.id,
            "action": "initiate_payment",
        },
    )

    return Response({"message": "Confirmed"}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def task_chat_history(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    if request.user != task.client and request.user != task.tasker:
        return Response({"error": "Not authorized"}, status=403)

    messages = TaskChatMessage.objects.filter(task=task).order_by("sent_at")
    return Response(
        [
            {
                "id": msg.id,
                "content": msg.content,
                "sent_at": msg.sent_at,
                "sender_id": msg.sender.id,
                "sender_username": msg.sender.username,
            }
            for msg in messages
        ]
    )
