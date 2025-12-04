.PHONY: start-server-old start-server start-client migrate makemigrations \
createsuperuser shell test-server reset-client freeze \
update-client install-server format-client lint-client \
reset-db test-client coverage-server start-redis stop-redis start-celery-windows start-celery \
docker-build docker-up docker-down docker-shell docker-migrate docker-migrations \
docker-createsuperuser docker-test docker-reset-db docker-restart docker-logs docker-up-d \
docker-running docker-collectstatic loaddata docker-loaddata docker-admin 

# =============================================================================
# [ SERVER TASKS ]
# =============================================================================

ifneq (,$(wildcard .env.make))
    include .env.make
    export
endif

print-vars:
	@echo "REDIS_SERVER = $(REDIS_SERVER)"
	@echo "REDIS_CLI = $(REDIS_CLI)"

start-server-old:
	cd backend && py -3.10 manage.py runserver 0.0.0.0:8000

start-server:
	cd backend && daphne -b 0.0.0.0 -p 8000 config.asgi:application

start-redis:
	@echo "Starting Redis server..."
	$(REDIS_SERVER)

stop-redis:
	@echo "Stopping Redis server..."
	$(REDIS_CLI) shutdown
	@echo "Redis server stopped."

start-celery-windows:
	cd backend && celery -A config worker --loglevel=info

start-celery:
	cd backend && celery -A config worker --loglevel=info --pool=solo

install-server:
	@cd backend && \
	echo "Checking backend dependencies..." && \
	pip install -r requirements.txt && \
	echo "All backend dependencies are installed and up to date."

freeze:
	cd backend && pip freeze > requirements.txt

reset-db:
	cd backend && rm db.sqlite3

migrate:
	cd backend && py -3.10 manage.py migrate

migrations:
	cd backend && py -3.10 manage.py makemigrations

createsuperuser:
	cd backend && py -3.10 manage.py createsuperuser

shell:
	cd backend && py -3.10 manage.py shell
	
test-server:
	cd backend && py -3.10 manage.py test -v 2

coverage-server:
	cd backend && coverage run manage.py test && coverage report

loaddata:
	cd backend && py -3.10 manage.py loaddata fixtures/users.json

# =============================================================================
# [ CLIENT TASKS ]
# =============================================================================
start-client:
	cd frontend && npx expo start --reset-cache

install-client:
	cd frontend && npm install

format-client:
	cd frontend && npm run format

lint-client:
	cd frontend && npm run lint

reset-client:
	cd frontend && rm -rf node_modules && rm -f package-lock.json && npm install

test-client:
	cd frontend && npm run test



# =============================================================================
# [ DOCKER TASKS ] 
# =============================================================================

docker-running:
	docker ps

docker-build:
	docker-compose build

docker-up:
	docker-compose up

docker-up-d:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-restart: docker-down docker-build docker-up

docker-shell:
	docker-compose exec django /bin/bash

docker-server-shell:
	docker-compose exec django python3 manage.py shell

docker-migrate:
	docker-compose exec django python3 manage.py migrate

docker-migrations:
	docker-compose exec django python3 manage.py makemigrations

docker-createsuperuser:
	docker-compose exec django python3 manage.py createsuperuser

docker-test:
	docker-compose exec django python3 manage.py test

docker-reset-db:
	docker-compose exec django rm -f db.sqlite3 && \
	docker-compose exec django python3 manage.py migrate

docker-collectstatic:
	docker-compose exec django python3 manage.py collectstatic --noinput

docker-admin:
	docker-compose exec django python3 manage.py runserver 0.0.0.0:8000

docker-loaddata:
	docker-compose exec django python3 manage.py loaddata fixtures/users.json







