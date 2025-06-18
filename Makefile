MANAGE=backend/manage.py

run:
	python $(MANAGE) runserver
migrate:
	python $(MANAGE) migrate
makemigrations:
	python $(MANAGE) makemigrations
createsuperuser:
	python $(MANAGE) createsuperuser
shell:
	python $(MANAGE) shell
test:
	python $(MANAGE) test