FROM python:3.11-slim

# set the dependences of the system
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# install the working directory
WORKDIR /app

# copy dependences
COPY requirements.txt .

# install python dependences
RUN pip install --no-cache-dir -r requirements.txt

# copy all backand code
COPY . .

# the default command (can be redefined in Docker-Compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
