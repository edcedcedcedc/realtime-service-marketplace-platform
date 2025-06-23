from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import JobSerializer
from .models import Job
from .utils import broadcast_job_update, broadcast_jobfeed_update

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

    if role not in ["worker", "client"]:
        return Response(
            {"error": "Role must be 'worker' or 'client'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=username, password=password, email=email, role=role
    )
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
def create_job(request):
    serializer = JobSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        job = serializer.save(client=request.user)
        broadcast_jobfeed_update(job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def open_jobs(request):
    jobs = Job.objects.filter(status="open").order_by("-id")
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def in_progress_jobs(request):
    jobs = Job.objects.filter(status="in_progress").order_by("-id")
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def completed_jobs(request):
    jobs = Job.objects.filter(status="completed").order_by("-id")
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def all_jobs(request):
    jobs = Job.objects.all().order_by("-id")
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def job_detail(request, pk):
    try:
        job = Job.objects.get(pk=pk)
        serializer = JobSerializer(job)
        return Response(serializer.data, status.HTTP_200_OK)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_400_BAD_REQUEST)
