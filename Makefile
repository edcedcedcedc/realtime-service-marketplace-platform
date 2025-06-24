.PHONY: run-http run-http-ws run-frontend migrate makemigrations \
createsuperuser shell test-backend reset-frontend freeze \
update-frontend install-backend format-frontend lint-frontend reset-db-backend test-frontend coverage-backend 
# =============================================================================
# [ BACKEND TASKS ]
# =============================================================================
run-http:
	cd backend && python manage.py runserver 0.0.0.0:8000
run-http-ws:
	cd backend && daphne -b 0.0.0.0 -p 8000 config.asgi:application
install-backend:
	@cd backend && \
	echo "Checking backend dependencies..." && \
	pip install -r requirements.txt --quiet && \
	echo "All backend dependencies are installed and up to date."
freeze:
	cd backend && pip freeze > requirements.txt
reset-db-backend:
	cd backend && rm db.sqlite3 && rm api/migrations/0*.py
migrate:
	cd backend && python manage.py migrate
migrations:
	cd backend && python manage.py makemigrations
createsuperuser:
	cd backend && python manage.py createsuperuser
shell:
	cd backend && python manage.py shell
test-backend:
	cd backend && python manage.py test -v 2
coverage-backend:
	cd backend && coverage run manage.py test && coverage report

# =============================================================================
# [ FRONTEND TASKS ]
# =============================================================================
run-frontend:
	cd frontend && npx expo start -c
install-frontend:
	cd frontend && npm install
format-frontend:
	cd frontend && npm run format
lint-frontend:
	cd frontend && npm run lint
reset-frontend:
	cd frontend && rm -rf node_modules && rm -f package-lock.json && npm install
test-frontend:
	cd frontend && npm run test





