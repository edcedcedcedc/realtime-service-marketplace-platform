.PHONY: backend frontend migrate makemigrations createsuperuser shell test

backend:
	cd backend && python manage.py runserver 0.0.0.0:8000
frontend:
	cd frontend && npx expo start
migrate:
	cd backend && python manage.py migrate
makemigrations:
	cd backend && python manage.py makemigrations
createsuperuser:
	cd backend && python manage.py createsuperuser
shell:
	cd backend && python manage.py shell
test backend:
	cd backend && python manage.py test -v 2