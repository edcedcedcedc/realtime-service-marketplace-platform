.PHONY: start-server-h start-server-hws start-client migrate makemigrations \
createsuperuser shell test-server reset-client freeze \
update-client install-server format-client lint-client \
reset-db test-client coverage-server start-server-r stop-server-r start-celery start-celery-windows \
docker-build docker-up docker-down docker-shell docker-migrate docker-migrations \
docker-create-superuser docker-test docker-reset-db docker-restart docker-logs docker-up-d \
docker-running-containers \

# =============================================================================
# [ BACKEND TASKS ]
# =============================================================================
start-server-h:
	cd backend && python manage.py runserver 0.0.0.0:8000
start-server-hws:
	cd backend && daphne -b 0.0.0.0 -p 8000 config.asgi:application
start-server-r:
	wsl -- bash -c "redis-server --daemonize yes && redis-cli ping"
stop-server-r:
	wsl -- bash -c "redis-cli shutdown && echo server-r shut down"
start-celery:
	cd backend && celery -A config worker --loglevel=info
start-celery-windows:
	cd backend && celery -A config worker --loglevel=info --pool=solo
install-server:
	@cd backend && \
	echo "Checking backend dependencies..." && \
	pip install -r requirements.txt --quiet && \
	echo "All backend dependencies are installed and up to date."
freeze:
	cd backend && pip freeze > requirements.txt
reset-db:
	cd backend && rm db.sqlite3 && rm api/migrations/0*.py
migrate:
	cd backend && python manage.py migrate
migrations:
	cd backend && python manage.py makemigrations
createsuperuser:
	cd backend && python manage.py createsuperuser
shell:
	cd backend && python manage.py shell
test-server:
	cd backend && python manage.py test -v 2
coverage-server:
	cd backend && coverage run manage.py test && coverage report

# =============================================================================
# [ FRONTEND TASKS ]
# =============================================================================
start-client:
	cd frontend && npx expo start -c
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

docker-running-containers:
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

docker-migrate:
	docker-compose exec django python3 manage.py migrate

docker-migrations:
	docker-compose exec django python3 manage.py makemigrations

docker-create-superuser:
	docker-compose exec django python3 manage.py createsuperuser

docker-test:
	docker-compose exec django python3 manage.py test

docker-reset-db:
	docker-compose exec django rm -f db.sqlite3 && \
	docker-compose exec django find . -path "*/migrations/*.py" -not -name "__init__.py" -delete && \
	docker-compose exec django python3 manage.py migrate





