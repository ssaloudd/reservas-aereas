from django.db import models
from django.core.validators import MinValueValidator

class Reserva(models.Model):
    ESTADOS = (
        ('P', 'Pendiente'),
        ('C', 'Confirmada'),
        ('X', 'Cancelada'),
    )

    usuario_id = models.IntegerField()  # ID del usuario en el servicio de usuarios
    vuelo_id = models.IntegerField()    # ID del vuelo en el servicio de vuelos
    fecha_reserva = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=1, choices=ESTADOS, default='P')
    asientos = models.IntegerField(validators=[MinValueValidator(1)])
    precio_total = models.DecimalField(max_digits=10, decimal_places=2)
    codigo_reserva = models.CharField(max_length=10, unique=True)

    class Meta:
        ordering = ['-fecha_reserva']
        indexes = [
            models.Index(fields=['usuario_id']),
            models.Index(fields=['vuelo_id']),
        ]

    def __str__(self):
        return f"Reserva {self.codigo_reserva} - Vuelo {self.vuelo_id}"

class Pasajero(models.Model):
    reserva = models.ForeignKey(Reserva, related_name='pasajeros', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    tipo_documento = models.CharField(max_length=20)
    numero_documento = models.CharField(max_length=50)
    fecha_nacimiento = models.DateField()

    def __str__(self):
        return f"{self.nombre} {self.apellido}"