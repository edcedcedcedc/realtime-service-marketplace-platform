## THIS PROJECT IS IN AN UNFINISHED STATE AND WON'T EVER BE RELEASED, YOU ARE FREE TO USE THIS SOFTWARE AS YOU WANT, THINK OF IT AS A GOOD BASE FOR A TAXI APP + SERVICES MARKETPLACE APP, I ASSUME AROUND A MONTH OF WORK AND IT CAN BE RELEASED AS A SMALL TECH BUSINESS 
# Real-time task marketplace platform

**connecting clients with workers for immediate, location-flexible tasks.  
Think Uber for services — with bidding, escrow, and instant payouts.

## Run / Install

### Server

1. Install backend dependencies:

   ```sh
   pip install -r requirements.txt
   ```

2. Install Redis (Windows):

   ```sh
   choco install redis
   ```

   or:

   ```sh
   choco install redis-64
   ```

3. Create **.env.make** in project root:

   ```
   REDIS_SERVER=
   REDIS_CLI=
   ```

4. Test your variables:

   ```sh
   make print-vars
   ```

5. Run migrations:

   ```sh
   make migrate
   ```

6. Create test users:

   ```sh
   python manage.py createsuperuser
   ```

7. Open Django shell and set roles:

   ```py
   user = User.objects.get(username="your_username")
   user.role = "tasker"      # or "client"
   user.save()
   ```

---

### Client

1. Install frontend dependencies:

   ```sh
   npm install
   ```

2. Create `.env`:

   ```
   IPV4="your_local_ipv4_address"
   ```

3. Start the app:

   ```sh
   npx expo start
   ```

🎉 That’s it — you're ready to run the application!


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
| Endpoint                      | Type | Description                                          |
| ----------------------------- | ---- | ---------------------------------------------------- |
| `/ws/taskfeed/`               | WS   | Broadcasts new and deleted tasks to all taskers.     |
| `/ws/taskrequests/<task_id>/` | WS   | Broadcasts task request updates for a specific task. |
| `/ws/notifications/`          | WS   | Sends real-time personal notifications to users.     |
| `/ws/taskchat/<task_id>/`     | WS   | Real-time chat between client and tasker for a task. |


## Tech Stack (Planned)
- **Frontend:** React Native  
- **Backend:** Django + Django Channels  
- **Real-Time:** WebSockets  
- **Payments:** Stripe/Paypal
- **Deployment:** Docker, PostgreSQL  

## Flowchart & Wireframe
Designed with Excalidraw for visual clarity.  
[View Flowchart & Wireframe](https://excalidraw.com/#json=brWpcnjNHEg5_k-d6PWrn,8x5ATqWcsx6cC__EVpoBtA)
