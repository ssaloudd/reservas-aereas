#!/bin/sh

# Aplica las migraciones de Django
python manage.py makemigrations gestion_reservas
python manage.py migrate

# Carga los datos de prueba
python manage.py load_reservas_data

# Inicia el servidor
exec python manage.py runserver 0.0.0.0:8002