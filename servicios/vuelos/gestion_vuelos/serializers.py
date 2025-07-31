from rest_framework import serializers
from .models import Aeropuerto, Aerolinea, Vuelo

class AeropuertoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aeropuerto
        fields = ['codigo', 'nombre', 'ciudad', 'pais']

class AerolineaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aerolinea
        fields = ['codigo', 'nombre']

class VueloSerializer(serializers.ModelSerializer):
    aerolinea = AerolineaSerializer(read_only=True)
    origen = AeropuertoSerializer(read_only=True)
    destino = AeropuertoSerializer(read_only=True)
    
    class Meta:
        model = Vuelo
        fields = ['id', 'codigo_vuelo', 'aerolinea', 'origen', 'destino', 
                 'fecha_salida', 'fecha_llegada', 'duracion', 
                 'asientos_disponibles', 'precio_base']