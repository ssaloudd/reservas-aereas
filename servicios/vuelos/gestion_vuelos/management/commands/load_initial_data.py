from django.core.management.base import BaseCommand
from gestion_vuelos.models import Aeropuerto, Aerolinea, Vuelo
from datetime import datetime, timedelta
import random
import decimal

class Command(BaseCommand):
    help = 'Carga datos iniciales para pruebas'
    
    def handle(self, *args, **options):
        # Aeropuertos - Nuevos aeropuertos agregados
        aeropuertos = [
            {'codigo': 'MAD', 'nombre': 'Adolfo Suárez Madrid-Barajas', 'ciudad': 'Madrid', 'pais': 'España'},
            {'codigo': 'BCN', 'nombre': 'Barcelona-El Prat', 'ciudad': 'Barcelona', 'pais': 'España'},
            {'codigo': 'CDG', 'nombre': 'Charles de Gaulle', 'ciudad': 'París', 'pais': 'Francia'},
            {'codigo': 'JFK', 'nombre': 'John F. Kennedy', 'ciudad': 'Nueva York', 'pais': 'EE.UU.'},
            {'codigo': 'MIA', 'nombre': 'Aeropuerto Internacional de Miami', 'ciudad': 'Miami', 'pais': 'EE.UU.'},
            {'codigo': 'EZE', 'nombre': 'Ministro Pistarini (Ezeiza)', 'ciudad': 'Buenos Aires', 'pais': 'Argentina'},
        ]
        
        for ap in aeropuertos:
            Aeropuerto.objects.get_or_create(**ap)
        
        # Aerolíneas - Nuevas aerolíneas agregadas
        aerolineas = [
            {'codigo': 'IB', 'nombre': 'Iberia'},
            {'codigo': 'VY', 'nombre': 'Vueling'},
            {'codigo': 'AF', 'nombre': 'Air France'},
            {'codigo': 'AA', 'nombre': 'American Airlines'},
            {'codigo': 'AR', 'nombre': 'Aerolíneas Argentinas'},
            {'codigo': 'LA', 'nombre': 'LATAM'},
        ]
        
        for al in aerolineas:
            Aerolinea.objects.get_or_create(**al)
        
        # Obtenemos los objetos de la base de datos
        mad = Aeropuerto.objects.get(codigo='MAD')
        bcn = Aeropuerto.objects.get(codigo='BCN')
        cdg = Aeropuerto.objects.get(codigo='CDG')
        jfk = Aeropuerto.objects.get(codigo='JFK')
        mia = Aeropuerto.objects.get(codigo='MIA')
        eze = Aeropuerto.objects.get(codigo='EZE')
        
        ib = Aerolinea.objects.get(codigo='IB')
        vy = Aerolinea.objects.get(codigo='VY')
        af = Aerolinea.objects.get(codigo='AF')
        aa = Aerolinea.objects.get(codigo='AA')
        ar = Aerolinea.objects.get(codigo='AR')
        la = Aerolinea.objects.get(codigo='LA')
        
        hoy = datetime.now()
        
        # ----------------------------------------------
        # Vuelos MAD-BCN (varios vuelos nacionales)
        # ----------------------------------------------
        for i in range(10):
            fecha_salida_nacional = hoy + timedelta(days=random.randint(1, 15), hours=random.randint(7, 20))
            precio_base = decimal.Decimal(str(random.uniform(50, 150))).quantize(decimal.Decimal('0.00'))
            
            Vuelo.objects.create(
                codigo_vuelo=f'IB{random.randint(1000, 9999)}',
                aerolinea=ib,
                origen=mad,
                destino=bcn,
                fecha_salida=fecha_salida_nacional,
                fecha_llegada=fecha_salida_nacional + timedelta(hours=1, minutes=30),
                duracion=timedelta(hours=1, minutes=30),
                asientos_disponibles=random.randint(50, 200),
                precio_base=precio_base
            )
            
        # ----------------------------------------------
        # Vuelos internacionales (nuevas rutas)
        # ----------------------------------------------
        
        # Vuelos MAD-JFK (larga distancia)
        for i in range(3):
            fecha_salida_larga = hoy + timedelta(days=random.randint(10, 60), hours=random.randint(8, 22))
            precio_base = decimal.Decimal(str(random.uniform(400, 1200))).quantize(decimal.Decimal('0.00'))
            
            Vuelo.objects.create(
                codigo_vuelo=f'AF{random.randint(100, 999)}',
                aerolinea=af,
                origen=mad,
                destino=jfk,
                fecha_salida=fecha_salida_larga,
                fecha_llegada=fecha_salida_larga + timedelta(hours=8, minutes=30),
                duracion=timedelta(hours=8, minutes=30),
                asientos_disponibles=random.randint(10, 100),
                precio_base=precio_base
            )
            
        # Vuelos BCN-MIA
        for i in range(2):
            fecha_salida_larga = hoy + timedelta(days=random.randint(20, 90), hours=random.randint(10, 23))
            precio_base = decimal.Decimal(str(random.uniform(500, 1500))).quantize(decimal.Decimal('0.00'))
            
            Vuelo.objects.create(
                codigo_vuelo=f'LA{random.randint(100, 999)}',
                aerolinea=la,
                origen=bcn,
                destino=mia,
                fecha_salida=fecha_salida_larga,
                fecha_llegada=fecha_salida_larga + timedelta(hours=9),
                duracion=timedelta(hours=9),
                asientos_disponibles=random.randint(15, 120),
                precio_base=precio_base
            )

        # Vuelos CDG-EZE
        for i in range(2):
            fecha_salida_larga = hoy + timedelta(days=random.randint(30, 120), hours=random.randint(15, 23))
            precio_base = decimal.Decimal(str(random.uniform(600, 1800))).quantize(decimal.Decimal('0.00'))

            Vuelo.objects.create(
                codigo_vuelo=f'AR{random.randint(100, 999)}',
                aerolinea=ar,
                origen=cdg,
                destino=eze,
                fecha_salida=fecha_salida_larga,
                fecha_llegada=fecha_salida_larga + timedelta(hours=14, minutes=30),
                duracion=timedelta(hours=14, minutes=30),
                asientos_disponibles=random.randint(10, 80),
                precio_base=precio_base
            )
        
        self.stdout.write(self.style.SUCCESS('Datos iniciales cargados con éxito'))
