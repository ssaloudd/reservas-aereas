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
Para el funcionamiento del punto de entrada único para los servicios y para cada uno de los mismos, es necesario ingresar a las carpetas de los servicios (reservas, usuarios y vuelos) y del punto (api-gateway). En estas, se deben crear un entorno virtual para cada una.

- :file_folder: Primer Terminal: reservas-aereas\servicios\usuarios
- :file_folder: Segundo Terminal: reservas-aereas\servicios\vuelos
- :file_folder: Tercer Terminal: reservas-aereas\servicios\reservas
- :file_folder: Cuarto Terminal: reservas-aereas\api-gateway
```
python -m venv venv
venv\Scripts\activate
```


###     2. Instalar dependencias
Con el entorno virtual activo se ejecuta:
- :file_folder: Primer Terminal: reservas-aereas\servicios\usuarios
- :file_folder: Segundo Terminal: reservas-aereas\servicios\vuelos
- :file_folder: Tercer Terminal: reservas-aereas\servicios\reservas
- :file_folder: Cuarto Terminal: reservas-aereas\api-gateway
```
pip install -r requirements.txt
```


###     3. Aplicar migraciones
- :file_folder: Primer Terminal: reservas-aereas\servicios\usuarios
```
python manage.py makemigrations usuarios
python manage.py migrate
```

- :file_folder: Segundo Terminal: reservas-aereas\servicios\vuelos
```
python manage.py makemigrations gestion_vuelos
python manage.py migrate
```

- :file_folder: Tercer Terminal: reservas-aereas\servicios\reservas
```
python manage.py makemigrations gestion_reservas
python manage.py migrate
```

- :file_folder: Cuarto Terminal: reservas-aereas\api-gateway
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
Con el entorno virtual activo:
```
venv\Scripts\activate
```

Se ejecuta:
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

- :file_folder: Cuarto Terminal: reservas-aereas\api-gateway
```
python manage.py runserver 8003
```


### :sunrise: **Frontend (NextJS)**

###     1. Instalar dependencias
- :file_folder: Quinto Terminal: reservas-aereas\frontend
```
npm install @tanstack/react-query @tanstack/react-query-devtools axios js-cookie @types/js-cookie
```

###     2. Ejecutar servidor
Después de instalar las dependencias necesarias, se ejecuta:
```
npm run dev
```

### :star2: **Ejecución**
Para comenzar, se debe ingresar a http://localhost:3000/auth/login