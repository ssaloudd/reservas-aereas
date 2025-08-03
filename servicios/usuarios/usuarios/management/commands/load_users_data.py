from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date

class Command(BaseCommand):
    help = 'Carga datos iniciales de usuarios para pruebas'
    
    def handle(self, *args, **options):
        User = get_user_model()
        
        # Datos de usuarios de prueba
        users_data = [
            {
                'username': 'jperez',
                'email': 'juan.perez@example.com',
                'password': 'SecurePass123',
                'first_name': 'Juan',
                'last_name': 'Pérez',
                'telefono': '+1234567890',
                'direccion': 'Calle Falsa 123',
                'fecha_nacimiento': date(1990, 5, 15)
            },
            {
                'username': 'mgarcia',
                'email': 'maria.garcia@example.com',
                'password': 'StrongPassword456',
                'first_name': 'María',
                'last_name': 'García',
                'telefono': '+9876543210',
                'direccion': 'Avenida Siempre Viva 742',
                'fecha_nacimiento': date(1985, 10, 22)
            },
            {
                'username': 'admin',
                'email': 'admin@admin.com',
                'password': 'admin',
                'first_name': 'admin',
                'last_name': 'admin',
                'telefono': '1111111111',
                'direccion': 'Oficina Central',
                'fecha_nacimiento': date(1980, 1, 1),
                'is_staff': True,
                'is_superuser': True  # Añade esto si necesitas un superusuario
            }
        ]
        
        for user_data in users_data:
            # Usa create_user para aprovechar la lógica de creación de usuarios
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],  # Esto activará tu set_password personalizado
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                telefono=user_data.get('telefono'),
                direccion=user_data.get('direccion'),
                fecha_nacimiento=user_data.get('fecha_nacimiento'),
                is_staff=user_data.get('is_staff', False),
                is_superuser=user_data.get('is_superuser', False)
            )
            
            self.stdout.write(self.style.SUCCESS(f'Usuario creado: {user.username}'))
        
        self.stdout.write(self.style.SUCCESS('Datos de usuarios cargados exitosamente'))