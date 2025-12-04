from .views import (
    accept_task_request_as_client,
    initiate_task_request_as_tasker,
    accept_terms,
    all_tasks,
    cancel_all_task_requests_as_client,
    cancel_task_request_as_tasker,
    cancel_task_request_as_client,
    completed_tasks,
    current_tsc_text,
    task_chat_history,
    task_requests_for_task_as_client,
    profile_detail_update,
    task_create,
    in_progress_tasks,
    task_delete,
    task_detail,
    task_requests_for_task_as_client,
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
    ######################################
    # AUTH and GENERAL
    ####################################
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/register/", register, name="register"),
    path("api/login/", login, name="login"),
    path("api/protected/", protected_view, name="protected"),
    path("api/accept-terms/", accept_terms, name="accept-terms"),
    path("api/current-tsc-text/", current_tsc_text, name="current-tsc-text"),
    path("api/profile/", profile_detail_update, name="profile-detail-update"),
    # tasker emit and unemit messages to add them and delete them
    # from client that listens incoming requests from taskers
    ######################################
    # TASKS
    ####################################
    path("api/tasks/open/", open_tasks, name="tasks-open"),
    path("api/tasks/in-progress/", in_progress_tasks, name="tasks-in-progress-"),
    path("api/tasks/completed/", completed_tasks, name="tasks-completed"),
    path("api/tasks/all/", all_tasks, name="tasks-all"),
    path("api/tasks/detail/<int:id>/", task_detail, name="task-detail"),
    path("api/tasks/create/", task_create, name="task-create"),
    path("api/tasks/update/<int:id>/", task_update, name="task-update"),
    path("api/tasks/delete/<int:id>/", task_delete, name="task-delete"),
    #########################################
    # TASK REQUESTS
    ########################################
    path(
        "api/initiate-task-request-as-tasker/",
        initiate_task_request_as_tasker,
        name="initiate-task-request-as-tasker",
    ),
    path(
        "api/accept-task-request-as-client/",
        accept_task_request_as_client,
        name="accept-task-request-as-client",
    ),
    path(
        "api/cancel-task-request-as-tasker/",
        cancel_task_request_as_tasker,
        name="cancel-task-request-as-tasker",
    ),
    path(
        "api/cancel-task-request-as-client/",
        cancel_task_request_as_client,
        name="cancel-task-request-as-client",
    ),
    path(
        "api/task-requests/<int:task_id>/",
        task_requests_for_task_as_client,
        name="task-requests-by-task-id",
    ),
    path(
        "api/cancel-all-task-requests-as-client/",
        cancel_all_task_requests_as_client,
        name="cancel-all-task-requests-as-client",
    ),
    #########################################
    # CHAT
    ########################################
    path(
        "api/task-chat-history/<int:task_id>/",
        task_chat_history,
        name="task-chat-history-by-task-id",
    ),
]
