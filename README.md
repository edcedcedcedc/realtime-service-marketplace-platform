# ⚡ Symmetrical Engine

**Symmetrical Engine** is a real-time task marketplace platform connecting clients with workers for immediate, location-flexible tasks.  
Think Uber for services — with bidding, escrow, and instant payouts.



## 🚀 Features

- 🔐 Client & Worker authentication  
- 🧑‍💼 Task posting with suggested budgets  
- ⏱ Live feed of available tasks for workers  
- 💬 Real-time task threads and optional chat  
- 💸 Bidding system with optional price negotiation  
- 🔒 Stripe-powered escrow payments  
- ✅ Task confirmation + worker rating system  
- 📈 Dashboards for task history and analytics  



## 📊 Flowchart & Wireframe

Designed with Excalidraw for visual clarity.  
🔗 [View Flowchart & Wireframe](https://excalidraw.com/#json=brWpcnjNHEg5_k-d6PWrn,8x5ATqWcsx6cC__EVpoBtA)



## 🎯 Client Flow

1. **Login**  
2. **Post Task**  
   - Title  
   - Description  
   - Location  
   - Suggested Budget (e.g., €15)  
   - Accept Bids or Not (toggle)  
3. **Live Task Thread**  
4. **Wait for Bids**  
   - See incoming bids (e.g., €19, €20, €15)  
   - View worker profiles, ratings  
   - Optional: Revise suggested budget  
5. **Accept Bid & Payment**  
   - Confirm selected bid  
   - Stripe Escrow Payment Hold (charge client & hold funds)  
6. **Confirm Completion**  
   - Real-time updates  
   - Stripe releases funds to worker  
7. **Rate Worker**  



## 🎯 Worker Flow

1. **Login**  
2. **Live Feed** — View new task posts  
3. **View Task**  
   - See client budget (e.g., €15)  
   - If Accept Bids = true → Show Place Bid button  
   - Else → Show Accept Task button  
4. **Wait for Acceptance/Bid** — Enter bid amount (e.g., €19)  
5. **Get Accepted** — Notification with payment info  
6. **Do the Task** — Real-time updates  
7. **Mark Done** — Mark "Task Started" then "Task Done"  
8. **Get Paid** — Stripe payout or automatic after client confirmation  



## 💳 Stripe Usage

- Escrow payment hold when client accepts bid  
- Notification and payment after task completion  
- Payouts to workers' linked accounts  



## 🛠️ Tech Stack (Planned)

- **Frontend:** React Native  
- **Backend:** Django + Django Channels  
- **Real-Time:** WebSockets  
- **Payments:** Stripe Connect  
- **Deployment:** Docker, PostgreSQL  



# Backend Documentation

## Overview

The backend is built with Django and Django REST Framework, providing a RESTful API for:

- User registration and JWT authentication  
- Task posting and management  
- Bidding system(not MVP, form MVP its static)...
- User profiles and ratings(in planning)



# Real-Time Task Feed Architecture

### Frontend (React Native)

1. User posts a task (HTTP POST request)
2. WebSocket connects on app startup
3. Listens for live task updates


### Communication Endpoints

* HTTP POST request: `/api/tasks/`
* WebSocket connection: `ws://<host>/ws/tasks/`



### ASGI Server (Daphne)

* Handles both HTTP and WebSocket protocols
* Routes requests appropriately based on protocol


### HTTP Request Flow

* HTTP POST request is handled by Django Views (`views.py`)
* The `create_task()` function:

  * Saves the task to the database
  * Broadcasts the new task event via Redis



### Redis (Channel Layer)

* Acts like a mailbox for message passing
* Stores and forwards messages between Django views and Channels consumers



### WebSocket Flow

* Django Channels Consumer (`TaskFeedConsumer`) subscribes to the task feed group
* Receives task update messages broadcasted through Redis



### Frontend WebSocket Client

* Remains connected to receive real-time WebSocket events
* Updates the task feed UI immediately upon receiving updates



Let me know if you want it in markdown syntax or need anything else!



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



## Authentication

* Uses JWT (JSON Web Tokens) via `djangorestframework-simplejwt`.
* Include token in HTTP header:

  ```http
  Authorization: Bearer <access_token>
  ```



## Task Status and Urgency (STILL IN REVIEW)

Each task has a **status** representing its current state in the workflow:

| Status          | Description                                           |
| --------------- | ----------------------------------------------------- |
| **open**        | Newly posted and awaiting bids or acceptance.         |
  accepted 
| **confirmed**   | Client confirmed task completion; payment released.    |
| **in-progress** | Worker started performing the task.                    |
| **completed**   | Worker marked task done, awaiting client confirmation. |
| **cancelled**   | Task was cancelled before completion.                  |
| **expired**     | Task expired without acceptance or completion.         |

Tasks also have an **urgency** level indicating expected timing:
(TIMINGS STILL IN REVIEW)

| Urgency      | Description                      |
| ------------ | -------------------------------- |
| **now**      | Immediate (within 5 minutes).    |
| **soon**     | Near future (within 30 minutes). |
| **flexible** | Later (within 1 hour).           |



## HOW TO START THE APP and INSTALL THE APP

From the root folder (`./`), run the commands in this order:

1. **install-client**  
   Install all dependencies for the frontend client.

2. **install-server**  
   Install all dependencies for the backend server.

3. **install redis-cli redis-server on WSL if using Windows(like myself)**
   On Ubuntu get redis-cli redis-server

4. **start-server-hws**  
   Start the backend HTTP + WebSocket servers.

5. **start-server-r**  
   Start redis server

6. **start-client**  
   Launch the React Native client app.

### HOW TO LAUNCH or START WITH DOCKER AS SERVER

ПЕРВЫЙ РАЗ 
git pull origin branchname 
make reset-db
make migrate
make loaddata && make docker-loaddata
make docker-restart or make docker-build && make docker-up


ПОСЛЕДУЮЩИЕ РАЗЫ
git pull origin branchname
make migrate 
make docker-restart or make docker-build make docker-up

КРЕДЕНЦИАЛЫ 
username: user1 password: user1 role: client
username: user2 password: user2 role: tasker

**Optional before committing:**  
- **format-client**  
  Run code formatters on the client codebase.


## Testing and Reliability

**Every other feature improvement — make sure to write tests for reliability:**

Before releasing a new version, always write:

- Unit tests for client and server  
- Integration tests for client and server  

To verify, run these commands:

```bash
coverage-server
test-server
test-client
```

## Git Workflow

- Checkout from `dev` branch to create your feature branch  
- When done, open a PR from your feature branch back into `dev`  
- When `dev` is ready, open a PR from `dev` into `master`


## Branch Naming Conventions

Please follow the branch naming guidelines described in [`docs/git-branching.txt`](docs/git-branching.txt).

## HOW



