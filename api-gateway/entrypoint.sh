#!/bin/sh

# Aplica las migraciones de Django
python manage.py makemigrations
python manage.py migrate

# Inicia el servidor
exec python manage.py runserver 0.0.0.0:8003