from django.core.management.base import BaseCommand
from gestion_reservas.models import Reserva, Pasajero
from datetime import datetime, timedelta
import random
import string

class Command(BaseCommand):
    help = 'Carga datos iniciales de reservas para pruebas'
    
    def handle(self, *args, **options):
        # Crear algunas reservas de prueba
        for i in range(1, 6):
            codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            reserva = Reserva.objects.create(
                usuario_id=i,
                vuelo_id=random.randint(1, 10),
                estado=random.choice(['P', 'C', 'X']),
                asientos=random.randint(1, 4),
                precio_total=random.uniform(100, 1000),
                codigo_reserva=codigo
            )
            
            # Crear pasajeros para cada reserva
            for j in range(1, reserva.asientos + 1):
                Pasajero.objects.create(
                    reserva=reserva,
                    nombre=f"Pasajero {j}",
                    apellido=f"Apellido {i}",
                    tipo_documento="Pasaporte",
                    numero_documento=f"DOC{random.randint(100000, 999999)}",
                    fecha_nacimiento=datetime.now() - timedelta(days=random.randint(365*20, 365*60))
                )
        
        self.stdout.write(self.style.SUCCESS('Datos de reservas cargados exitosamente'))