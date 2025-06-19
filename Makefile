.PHONY: run-backend run-frontend migrate makemigrations \
createsuperuser shell test-backend reset-frontend update-backend \
 update-frontend install-backend format-frontend lint-frontend reset-db-backend 
# =============================================================================
# [ BACKEND TASKS ]
# =============================================================================
run-backend:
	cd backend && python manage.py runserver 0.0.0.0:8000
install-backend:
	@cd backend && \
	echo "Checking backend dependencies..." && \
	pip install -r requirements.txt --quiet && \
	echo "All backend dependencies are installed and up to date."
update-backend:
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
	cd frontend && rm -rf node_modules && rm -f package.json package-lock.json
	cd frontend && npm install





