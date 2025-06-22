from .views import (
    all_jobs,
    completed_jobs,
    create_job,
    in_progress_jobs,
    job_detail,
    open_jobs,
    register,
    login,
)
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import protected_view

urlpatterns = [
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/register/", register, name="register"),
    path("api/login/", login, name="login"),
    path("api/protected/", protected_view, name="protected"),
    # Jobs endpoints
    path("api/jobs/open/", open_jobs, name="open-jobs"),
    path("api/jobs/in-progress/", in_progress_jobs, name="in-progress-jobs"),
    path("api/jobs/completed/", completed_jobs, name="completed-jobs"),
    path("api/jobs/all/", all_jobs, name="all-jobs"),
    path("api/jobs/<int:pk>/", job_detail, name="job-detail"),
    path("api/jobs/", create_job, name="job-create"),
]
