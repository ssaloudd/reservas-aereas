<h1 align="center"> # Reservas Aéreas :airplane: </h1>

Aplicación Web de reserva de tickets aéreos.


## :clipboard: Requisitos previos

- Python 3.12
- Git


## Clonar el repositorio
```
https://github.com/ssaloudd/reservas-aereas.git
```


### :rocket: **Backend (Django)**

###     1. Crear y ejecutar un entorno virtual
Para el funcionamiento de cada servicio, es necesario ingresar a cada carpeta (reservas, usuarios y vuelos). En estas, se deben crear un entorno virtual para cada una.

- :file_folder: Primer Terminal: reservas-aereas\servicios\usuarios
- :file_folder: Segundo Terminal: reservas-aereas\servicios\vuelos
- :file_folder: Tercer Terminal: reservas-aereas\servicios\reservas
```
python -m venv venv
venv\Scripts\activate
```


###     2. Instalar dependencias
Con el entorno virtual activo se ejecuta:
- :file_folder: Primer Terminal: reservas-aereas\servicios\usuarios
```
pip install django djangorestframework psycopg2-binary pyjwt cryptography
pip install djangorestframework-simplejwt
```

- :file_folder: Segundo Terminal: reservas-aereas\servicios\vuelos
```
pip install django djangorestframework django-filter
```

- :file_folder: Tercer Terminal: reservas-aereas\servicios\reservas
```
pip install django djangorestframework django-filter psycopg2-binary requests cachecontrol django-rest-framework-token
pip install djangorestframework-simplejwt
```


###     3. Aplicar migraciones
- :bookmark_tabs: :three: En los 3 terminales se ejecutan las siguientes líneas:
```
python manage.py makemigrations
python manage.py migrate
```


###     4. Datos de Prueba
- :file_folder: Primer Terminal: reservas-aereas\servicios\usuarios
```
python manage.py load_users_data
```

- :file_folder: Segundo Terminal: reservas-aereas\servicios\vuelos
```
python manage.py load_initial_data
```

- :file_folder: Tercer Terminal: reservas-aereas\servicios\reservas
```
python manage.py load_reservas_data
```


###     5. Crear super-usuario (opcional)
Se puede crear el usuario administrador en "vuelos" y "reservas" para la creación de datos de prueba. En "usuarios", el admininistrador ya se encuentra en los datos de prueba:
```
python manage.py createsuperuser
```
Llenar con los datos pedidos en consola (para desarrollo solo poner como `Username: admin`, `Email address: admin@admin.com` y `Password: admin`).


###     6. Ejecutar servidor
Con el entorno virtual activo, se ejecuta:
- :file_folder: Primer Terminal: reservas-aereas\servicios\usuarios
```
python manage.py runserver 8001
```

- :file_folder: Segundo Terminal: reservas-aereas\servicios\vuelos
```
python manage.py runserver 8000
```

- :file_folder: Tercer Terminal: reservas-aereas\servicios\reservas
```
python manage.py runserver 8002
```


### :sunrise: **Frontend ()**

### :star2: **Ejecución**