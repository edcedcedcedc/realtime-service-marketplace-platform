# ⚡ Symmetrical Engine

**Symmetrical Engine** is a real-time job marketplace platform connecting clients with workers for immediate, location-flexible tasks. Think Uber for services — with bidding, escrow, and instant payouts.

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


Client Flow:
-------------
1. [Login]
2. [Post Job]
    - Title
    - Description
    - Location (Optional)
    - Suggested Budget (e.g., €15)
    - [✓ Accept Bids] (toggle)
3. [Live Job Thread]
4. [Wait for Bids]
    - See incoming bids (e.g., €19, €20, €15)
    - View worker profiles, ratings
    - Optional: Revise suggested budget
5. [Accept Bid/Payment]
    - Confirm selected bid
    - [Stripe Escrow Payment Hold]
        - Charge client (Stripe API)
        - Hold funds until job marked done
6. [Confirm Completion]
    - Real-time updates
    - [Confirm Completion]
        - [Stripe Releases Funds to Worker]
7. [Rate Worker]

--------------------------------------------------

Worker Flow:
-------------
1. [Login]
2. [Live Feed]
    - View new job posts
3. [View Job]
    - See client budget (e.g., €15)
    - If [Accept Bids] = true → show [Place Bid] button
    - If not → show [Accept Job] button
4. [Wait for Acceptance/Bid]
    - Enter bid amount (e.g., €19)
5. [Get Accepted]
    - Notification of acceptance
        - [Stripe: You'll Get Paid After Completion]
6. Do the job
    - Real-time updates
7. [Mark done]
    - Mark "Job Started", then "Job Done"
8. [Get paid]
    - [Stripe Payout to Linked Account]
    - or automatic after client confirmation

--------------------------------------------------

STRIPE is used for:
- Escrow payment hold (when client accepts bid)
- Notification/payment after job completion
- Payout to worker

## 🛠️ Tech Stack (Planned)

- **Frontend**: React Native
- **Backend**: Django + Django Channels
- **Real-Time**: WebSockets
- **Payments**: Stripe Connect
- **Deployment**: Docker, PostgreSQL


# Backend Documentation

## Overview

This backend is built with Django and Django REST Framework. It provides a RESTful API for a job marketplace platform, supporting user registration, authentication (JWT), job posting, bidding, and rating.

---

## Features

- **User Registration & Authentication:**  
  Users can register and log in using JWT-based authentication.

- **Job Management:**  
  Clients can post jobs with details like title, description, location, and budget.

- **Bidding System:**  
  Workers can view jobs and place bids. Clients can accept bids and payments are managed via Stripe (planned).

- **User Profiles & Ratings:**  
  Each user has a profile and can be rated after job completion.

---

## API Endpoints

| Endpoint                | Method | Description                        |
|-------------------------|--------|------------------------------------|
| `api/register/`        | POST   | Register a new user                |
| `api/login/`           | POST   | Login user                |
| `api/token/`           | POST   | Obtain JWT access and refresh token|
| `api/token/refresh/`   | POST   | Refresh JWT access token           |
| `api/jobs/open/`       |  GET   | List open jobs |
| `api/jobs/`            | POST    | Create a job |
| `/api/profile/`         | GET    | Get user profile (to be implemented) |


---

## Authentication

- Uses JWT (JSON Web Tokens) via `djangorestframework-simplejwt`.
- Include the token in the `Authorization` header as:  
  ```
  Authorization: Bearer <access_token>
  ```

---

## Running Common Commands

Use the provided `Makefile` or `manage.bat` for common tasks:

- `make run`  — Start the server
- `make migrate`  — Apply migrations
- `make createsuperuser` — Create admin user

---

## Development Notes

- Database: SQLite for development (PostgreSQL recommended for production)
- All API endpoints are under `/api/`
- Extend models and endpoints as needed for your use case

---

