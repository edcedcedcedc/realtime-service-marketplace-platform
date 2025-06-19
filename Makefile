.PHONY: run-backend run-frontend migrate makemigrations \
createsuperuser shell test-backend reset-frontend update-backend \
 update-frontend install-backend format-frontend lint-frontend 
# Run Django server
run-backend:
	cd backend && python manage.py runserver 0.0.0.0:8000
run-frontend:
	cd frontend && npx expo start -c
migrate:
	cd backend && python manage.py migrate
makemigrations:
	cd backend && python manage.py makemigrations
createsuperuser:
	cd backend && python manage.py createsuperuser
shell:
	cd backend && python manage.py shell
test-backend:
	cd backend && python manage.py test -v 2
reset-frontend:
	cd frontend && rm -rf node_modules && rm -f package.json package-lock.json
	cd frontend && npm install
# Its a bit noizy it install global packs, I use no virtual environment
install-backend:
	@cd backend && \
	echo "Checking backend dependencies..." && \
	pip install -r requirements.txt --quiet && \
	echo "All backend dependencies are installed and up to date."
update-backend:
	cd backend && pip freeze > requirements.txt
update-frontend:
	cd frontend && npm install
format-frontend:
	cd frontend && npm run format
lint-frontend:
	cd frontend && npm run lint

