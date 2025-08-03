from django.core.management.base import BaseCommand
from gestion_vuelos.models import Aeropuerto, Aerolinea, Vuelo
from datetime import datetime, timedelta
import random
import decimal

class Command(BaseCommand):
    help = 'Carga datos iniciales para pruebas'
    
    def handle(self, *args, **options):
        # Aeropuertos
        aeropuertos = [
            {'codigo': 'MAD', 'nombre': 'Adolfo Suárez Madrid-Barajas', 'ciudad': 'Madrid', 'pais': 'España'},
            {'codigo': 'BCN', 'nombre': 'Barcelona-El Prat', 'ciudad': 'Barcelona', 'pais': 'España'},
            {'codigo': 'CDG', 'nombre': 'Charles de Gaulle', 'ciudad': 'París', 'pais': 'Francia'},
            {'codigo': 'JFK', 'nombre': 'John F. Kennedy', 'ciudad': 'Nueva York', 'pais': 'EE.UU.'},
        ]
        
        for ap in aeropuertos:
            Aeropuerto.objects.get_or_create(**ap)
        
        # Aerolíneas
        aerolineas = [
            {'codigo': 'IB', 'nombre': 'Iberia'},
            {'codigo': 'VY', 'nombre': 'Vueling'},
            {'codigo': 'AF', 'nombre': 'Air France'},
            {'codigo': 'AA', 'nombre': 'American Airlines'},
        ]
        
        for al in aerolineas:
            Aerolinea.objects.get_or_create(**al)
        
        # Vuelos
        mad = Aeropuerto.objects.get(codigo='MAD')
        bcn = Aeropuerto.objects.get(codigo='BCN')
        cdg = Aeropuerto.objects.get(codigo='CDG')
        jfk = Aeropuerto.objects.get(codigo='JFK')
        
        ib = Aerolinea.objects.get(codigo='IB')
        vy = Aerolinea.objects.get(codigo='VY')
        af = Aerolinea.objects.get(codigo='AF')
        aa = Aerolinea.objects.get(codigo='AA')
        
        hoy = datetime.now()
        
        # Vuelos MAD-BCN
        for i in range(5):
            fecha_salida = hoy + timedelta(days=i, hours=random.randint(7, 20))
            precio_base = decimal.Decimal(str(random.uniform(50, 150))).quantize(decimal.Decimal('0.00'))
            
            Vuelo.objects.create(
                codigo_vuelo=f'IB{random.randint(1000, 9999)}',
                aerolinea=ib,
                origen=mad,
                destino=bcn,
                fecha_salida=fecha_salida,
                fecha_llegada=fecha_salida + timedelta(hours=1),
                duracion=timedelta(hours=1),
                asientos_disponibles=random.randint(5, 50),
                precio_base=precio_base  # Usamos Decimal directamente
            )
        
        self.stdout.write(self.style.SUCCESS('Datos iniciales cargados con éxito'))