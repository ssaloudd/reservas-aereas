from rest_framework import serializers
from .models import Reserva, Pasajero
import decimal

class PasajeroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pasajero
        fields = ['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'fecha_nacimiento']

class ReservaSerializer(serializers.ModelSerializer):
    pasajeros = PasajeroSerializer(many=True, required=True)
    vuelo_id = serializers.IntegerField(required=True)
    asientos = serializers.IntegerField(required=True, min_value=1)
    
    class Meta:
        model = Reserva
        fields = ['id', 'vuelo_id', 'asientos', 'pasajeros', 'precio_total', 'estado', 'codigo_reserva']
        read_only_fields = ['id', 'precio_total', 'estado', 'codigo_reserva']
        
    def create(self, validated_data):
        pasajeros_data = validated_data.pop('pasajeros')
        
        # Convertir precio_total a Decimal si viene como string
        if 'precio_total' in validated_data:
            try:
                validated_data['precio_total'] = decimal.Decimal(str(validated_data['precio_total']))
            except (decimal.InvalidOperation, ValueError):
                raise serializers.ValidationError({"precio_total": "Formato de precio inválido"})
        
        reserva = Reserva.objects.create(**validated_data)
        
        for pasajero_data in pasajeros_data:
            Pasajero.objects.create(reserva=reserva, **pasajero_data)
            
        return reserva

    def validate_asientos(self, value):
        if value < 1:
            raise serializers.ValidationError("Debe reservar al menos 1 asiento")
        if value > 10:
            raise serializers.ValidationError("No puede reservar más de 10 asientos")
        return value

    def validate_pasajeros(self, value):
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un pasajero")
        return value