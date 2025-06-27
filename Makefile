.PHONY: start-server-h start-server-hws start-client migrate makemigrations \
createsuperuser shell test-server reset-client freeze \
update-client install-server format-client lint-client \
reset-db test-client coverage-server start-server-r stop-server-r 

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





