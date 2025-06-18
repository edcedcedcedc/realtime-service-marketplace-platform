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

## 📌 Phase 1 Goals

- [ ] Implement login / signup flow
- [ ] Post job & live feed system
- [ ] Basic bidding interaction
- [ ] Job thread & status transitions
- [ ] Stripe escrow logic
- [ ] Build MVP UI with core screens

---

### Backend workflow
source venv/bin/activate - virtual env 
deactivate
python manage.py migrate - after db updates
python manage.py runserver - run dev server

api - will handle core logic — jobs, bids, users, chats
REST Framework - will let you expose APIs consumed by your React Native frontend