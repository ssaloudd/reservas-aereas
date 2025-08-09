from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Reserva, Pasajero
from .serializers import ReservaSerializer
from .clients import VuelosClient, UsuariosClient
import random
import string
import decimal  # Importar decimal para manejo prec
import requests
from django.conf import settings

class ReservaListCreateView(generics.ListCreateAPIView):
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reserva.objects.filter(usuario_id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        # 1. Verificar vuelo
        vuelo_id = request.data.get('vuelo_id')
        vuelo = VuelosClient.obtener_vuelo(vuelo_id)
        if not vuelo:
            return Response(
                {"error": "Vuelo no encontrado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Verificar asientos
        try:
            asientos_solicitados = int(request.data.get('asientos', 1))
            if vuelo.get('asientos_disponibles', 0) < asientos_solicitados:
                return Response(
                    {"error": "No hay suficientes asientos disponibles"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 3. Calcular precio con decimales
            precio_base = decimal.Decimal(str(vuelo['precio_base'])).normalize()
            precio_total = (precio_base * asientos_solicitados).quantize(decimal.Decimal('0.00'))

        except (ValueError, decimal.InvalidOperation, KeyError) as e:
            return Response(
                {"error": f"Datos numéricos inválidos: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Crear reserva
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        reserva = serializer.save(
            usuario_id=request.user.id,
            codigo_reserva=codigo,
            precio_total=precio_total  # Usamos el decimal calculado
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReservaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reserva.objects.filter(usuario_id=self.request.user.id)

    def perform_destroy(self, instance):
        # En lugar de borrar, cambiamos el estado a cancelado
        instance.estado = 'X'
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)