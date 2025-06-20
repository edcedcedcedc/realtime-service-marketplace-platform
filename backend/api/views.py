from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated


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
        return Response({"error": "Email already exists."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken."}, status=400)

    if role not in ["worker", "client"]:
        return Response(
            {"error": "Role must be 'worker' or 'client'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    is_worker = role == "worker"
    is_client = role == "client"

    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        is_worker=(role == "worker"),
        is_client=(role == "client"),
    )
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "message": "User registered and logged in successfully.",
            "email": email,
            "username": username,
            "role": role,
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
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {"id": user.id, "username": user.username},
            }
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
