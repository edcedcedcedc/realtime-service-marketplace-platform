# Symmetrical Engine

**Symmetrical Engine** is a real-time task marketplace platform connecting clients with workers for immediate, location-flexible tasks.  
Think Uber for services — with bidding, escrow, and instant payouts.

## Run/Install 
server:
install requirements
choco install redis or choco install redis server 
create a .env.make 
    REDIS_SERVER = 
    REDIS_CLI    = 
test your vars with make print-vars
run migration
create your test users with python manage.py createsuperuser
open python shell and get the user with User.objects.get(username) and set the role to tasker and another user the role for client

client:
install requirements
create .env set IPV4="your IPV4 address"

run the app, congratz!

---

## API Endpoints

| Endpoint                         | Method    | Description                          |
|---------------------------------|-----------|------------------------------------|
| `/api/register/`                | POST      | Register a new user                 |
| `/api/login/`                   | POST      | User login                         |
| `/api/token/`                  | POST      | Obtain JWT access and refresh tokens |
| `/api/token/refresh/`          | POST      | Refresh JWT access token           |
| `/api/protected/`              | GET       | Example protected endpoint         |

### Task Endpoints

| Endpoint                          | Method    | Description                  |
|----------------------------------|-----------|------------------------------|
| `/api/tasks/open/`                | GET       | Get open tasks                |
| `/api/tasks/in-progress/`         | GET       | Get in-progress tasks         |
| `/api/tasks/completed/`           | GET       | Get completed tasks           |
| `/api/tasks/all/`                 | GET       | Get all tasks                 |
| `/api/tasks/detail/<int:id>/`    | GET       | Get task by ID                |
| `/api/tasks/create/`              | POST      | Create a new task             |
| `/api/tasks/update/<int:id>/`    | PUT/PATCH | Update task by ID             |
| `/api/tasks/delete/<int:id>/`    | DELETE    | Delete task by ID             |

## WebSocket Endpoints
| Endpoint                      | Method |                                                                                                                              
| ----------------------------- |------- |------------------------------------------------------------------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/ws/taskfeed/`               | WS     | Task Feed channel: broadcast new and deleted tasks to all taskers. No client messages expected.                               
| `/ws/taskrequests/<task_id>/` | WS     | Task Requests channel for a specific task: broadcasts updates about task requests related to the given task. No client messages expected.|
| `/ws/notifications/`          | WS     | User Notifications channel: sends direct notifications to individual users (taskers or clients). No client messages expected.|
| `/ws/taskchat/<task_id>/`     | WS     | Task Chat channel for real-time chat between the client and tasker participants of the task. Client sends and receives chat messages.|

## Tech Stack (Planned)
- **Frontend:** React Native  
- **Backend:** Django + Django Channels  
- **Real-Time:** WebSockets  
- **Payments:** Stripe/Paypal
- **Deployment:** Docker, PostgreSQL  

## Flowchart & Wireframe
Designed with Excalidraw for visual clarity.  
[View Flowchart & Wireframe](https://excalidraw.com/#json=brWpcnjNHEg5_k-d6PWrn,8x5ATqWcsx6cC__EVpoBtA)