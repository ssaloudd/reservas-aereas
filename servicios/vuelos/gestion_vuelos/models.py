from django.db import models
from django.core.validators import MinValueValidator

class Aeropuerto(models.Model):
    codigo = models.CharField(max_length=3, unique=True)
    nombre = models.CharField(max_length=100)
    ciudad = models.CharField(max_length=100)
    pais = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class Aerolinea(models.Model):
    codigo = models.CharField(max_length=2, unique=True)
    nombre = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class Vuelo(models.Model):
    codigo_vuelo = models.CharField(max_length=10, unique=True)
    aerolinea = models.ForeignKey(Aerolinea, on_delete=models.CASCADE)
    origen = models.ForeignKey(Aeropuerto, related_name='vuelos_salida', on_delete=models.CASCADE)
    destino = models.ForeignKey(Aeropuerto, related_name='vuelos_llegada', on_delete=models.CASCADE)
    fecha_salida = models.DateTimeField()
    fecha_llegada = models.DateTimeField()
    duracion = models.DurationField()
    asientos_disponibles = models.IntegerField(validators=[MinValueValidator(0)])
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        indexes = [
            models.Index(fields=['origen', 'destino', 'fecha_salida']),
        ]
    
    def __str__(self):
        return f"{self.codigo_vuelo} - {self.origen} a {self.destino}"