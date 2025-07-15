from .views import (
    accept_terms,
    all_tasks,
    cancel_task_request,
    completed_tasks,
    current_tsc_text,
    profile_detail_update,
    task_create,
    in_progress_tasks,
    task_delete,
    task_detail,
    task_request,
    task_update,
    open_tasks,
    register,
    login,
    protected_view,
)
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/register/", register, name="register"),
    path("api/login/", login, name="login"),
    path("api/protected/", protected_view, name="protected"),
    path("api/accept-terms/", accept_terms, name="accept-terms"),
    path("api/current-tsc-text/", current_tsc_text, name="current-tsc-text"),
    # tasks endpoints
    path("api/tasks/open/", open_tasks, name="tasks-open"),
    path("api/tasks/in-progress/", in_progress_tasks, name="tasks-in-progress-"),
    path("api/tasks/completed/", completed_tasks, name="tasks-completed"),
    path("api/tasks/all/", all_tasks, name="tasks-all"),
    path("api/tasks/detail/<int:id>/", task_detail, name="task-detail"),
    path("api/tasks/create/", task_create, name="task-create"),
    path("api/tasks/update/<int:id>/", task_update, name="task-update"),
    path("api/tasks/delete/<int:id>/", task_delete, name="task-delete"),
    # profile endpoint
    path("api/profile/", profile_detail_update, name="profile-detail-update"),
    # tasker emit and unemit messages to add them and delete them
    # from client that listens incoming requests from taskers
    path("api/task-request/", task_request, name="task-request"),
    path("api/cancel-task-request/", cancel_task_request, name="cancel-task-request"),
]
