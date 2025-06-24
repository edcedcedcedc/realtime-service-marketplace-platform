from .views import (
    all_jobs,
    completed_jobs,
    job_create,
    in_progress_jobs,
    job_detail,
    job_update,
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
    path("api/jobs/open/", open_jobs, name="jobs-open"),
    path("api/jobs/in-progress/", in_progress_jobs, name="jobs-in-progress-"),
    path("api/jobs/completed/", completed_jobs, name="jobs-completed"),
    path("api/jobs/all/", all_jobs, name="jobs-all"),
    path("api/jobs/detail/<int:id>/", job_detail, name="job-detail"),
    path("api/jobs/create/", job_create, name="job-create"),
    path("api/jobs/update/<int:id>/", job_update, name="job-update"),
]
