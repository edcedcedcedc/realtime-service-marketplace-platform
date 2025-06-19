run:
	cd backend && python manage.py runserver 0.0.0.0:8000
migrate:
	cd backend && python manage.py migrate
makemigrations:
	cd backend && python manage.py makemigrations
createsuperuser:
	cd backend && python manage.py createsuperuser
shell:
	cd backend && python manage.py shell
test:
	cd backend && python manage.py test -v 2