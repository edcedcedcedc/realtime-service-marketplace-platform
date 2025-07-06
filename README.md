# ⚡ Symmetrical Engine

**Symmetrical Engine** is a real-time job marketplace platform connecting clients with workers for immediate, location-flexible tasks.  
Think Uber for services — with bidding, escrow, and instant payouts.



## 🚀 Features

- 🔐 Client & Worker authentication  
- 🧑‍💼 Job posting with suggested budgets  
- ⏱ Live feed of available jobs for workers  
- 💬 Real-time job threads and optional chat  
- 💸 Bidding system with optional price negotiation  
- 🔒 Stripe-powered escrow payments  
- ✅ Job confirmation + worker rating system  
- 📈 Dashboards for job history and analytics  



## 📊 Flowchart & Wireframe

Designed with Excalidraw for visual clarity.  
🔗 [View Flowchart & Wireframe](https://excalidraw.com/#json=brWpcnjNHEg5_k-d6PWrn,8x5ATqWcsx6cC__EVpoBtA)



## 🎯 Client Flow

1. **Login**  
2. **Post Job**  
   - Title  
   - Description  
   - Location  
   - Suggested Budget (e.g., €15)  
   - Accept Bids or Not (toggle)  
3. **Live Job Thread**  
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
2. **Live Feed** — View new job posts  
3. **View Job**  
   - See client budget (e.g., €15)  
   - If Accept Bids = true → Show Place Bid button  
   - Else → Show Accept Job button  
4. **Wait for Acceptance/Bid** — Enter bid amount (e.g., €19)  
5. **Get Accepted** — Notification with payment info  
6. **Do the Job** — Real-time updates  
7. **Mark Done** — Mark "Job Started" then "Job Done"  
8. **Get Paid** — Stripe payout or automatic after client confirmation  



## 💳 Stripe Usage

- Escrow payment hold when client accepts bid  
- Notification and payment after job completion  
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
- Job posting and management  
- Bidding system(not MVP, form MVP its static)...
- User profiles and ratings(in planning)



# Real-Time Job Feed Architecture

### Frontend (React Native)

1. User posts a job (HTTP POST request)
2. WebSocket connects on app startup
3. Listens for live job updates


### Communication Endpoints

* HTTP POST request: `/api/jobs/`
* WebSocket connection: `ws://<host>/ws/jobs/`



### ASGI Server (Daphne)

* Handles both HTTP and WebSocket protocols
* Routes requests appropriately based on protocol


### HTTP Request Flow

* HTTP POST request is handled by Django Views (`views.py`)
* The `create_job()` function:

  * Saves the job to the database
  * Broadcasts the new job event via Redis



### Redis (Channel Layer)

* Acts like a mailbox for message passing
* Stores and forwards messages between Django views and Channels consumers



### WebSocket Flow

* Django Channels Consumer (`JobFeedConsumer`) subscribes to the job feed group
* Receives job update messages broadcasted through Redis



### Frontend WebSocket Client

* Remains connected to receive real-time WebSocket events
* Updates the job feed UI immediately upon receiving updates



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

### Job Endpoints

| Endpoint                          | Method    | Description                  |
|----------------------------------|-----------|------------------------------|
| `/api/jobs/open/`                | GET       | Get open jobs                |
| `/api/jobs/in-progress/`         | GET       | Get in-progress jobs         |
| `/api/jobs/completed/`           | GET       | Get completed jobs           |
| `/api/jobs/all/`                 | GET       | Get all jobs                 |
| `/api/jobs/detail/<int:id>/`    | GET       | Get job by ID                |
| `/api/jobs/create/`              | POST      | Create a new job             |
| `/api/jobs/update/<int:id>/`    | PUT/PATCH | Update job by ID             |
| `/api/jobs/delete/<int:id>/`    | DELETE    | Delete job by ID             |



## WebSocket Endpoint

| Endpoint             | Description                  |
|----------------------|------------------------------|
| `ws://<host>/ws/jobs/` | Real-time job feed updates  |

**Django routing:**

```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/jobs/$", consumers.JobFeedConsumer.as_asgi()),
]
````



## Authentication

* Uses JWT (JSON Web Tokens) via `djangorestframework-simplejwt`.
* Include token in HTTP header:

  ```http
  Authorization: Bearer <access_token>
  ```



## Job Status and Urgency (STILL IN REVIEW)

Each job has a **status** representing its current state in the workflow:

| Status          | Description                                           |
| --------------- | ----------------------------------------------------- |
| **open**        | Newly posted and awaiting bids or acceptance.         |
| **accepted**    | Bid or worker accepted by client.                     |
| **in-progress** | Worker started performing the job.                    |
| **completed**   | Worker marked job done, awaiting client confirmation. |
| **confirmed**   | Client confirmed job completion; payment released.    |
| **cancelled**   | Job was cancelled before completion.                  |
| **expired**     | Job expired without acceptance or completion.         |

Jobs also have an **urgency** level indicating expected timing:
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

3. **start-server-hws**  
   Start the backend HTTP + WebSocket servers.

4. **start-server-r**  
   Start redis server

5. **start-client**  
   Launch the React Native client app.



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

