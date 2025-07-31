from rest_framework import generics, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vuelo, Aeropuerto
from .serializers import VueloSerializer, AeropuertoSerializer
from django.utils import timezone
from datetime import datetime

class BusquedaVuelosView(generics.ListAPIView):
    serializer_class = VueloSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_salida', 'precio_base']
    
    def get_queryset(self):
        queryset = Vuelo.objects.filter(
            fecha_salida__gte=timezone.now(),
            asientos_disponibles__gt=0
        ).select_related('origen', 'destino', 'aerolinea')
        
        # Filtro por código de aeropuerto de origen
        origen_code = self.request.query_params.get('origen')
        if origen_code:
            queryset = queryset.filter(origen__codigo=origen_code)
        
        # Filtro por código de aeropuerto de destino
        destino_code = self.request.query_params.get('destino')
        if destino_code:
            queryset = queryset.filter(destino__codigo=destino_code)
        
        # Filtro por fecha
        fecha = self.request.query_params.get('fecha')
        if fecha:
            try:
                fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_salida__date=fecha_obj)
            except ValueError:
                pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            # Verificar si los códigos de aeropuerto existen
            origen_code = request.query_params.get('origen')
            destino_code = request.query_params.get('destino')
            
            if origen_code and not Aeropuerto.objects.filter(codigo=origen_code).exists():
                return Response(
                    {"error": f"Código de aeropuerto de origen '{origen_code}' no válido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if destino_code and not Aeropuerto.objects.filter(codigo=destino_code).exists():
                return Response(
                    {"error": f"Código de aeropuerto de destino '{destino_code}' no válido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().list(request, *args, **kwargs)
            
        except Exception as e:
            return Response(
                {"error": "Error procesando la solicitud", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VueloDetailView(generics.RetrieveAPIView):
    queryset = Vuelo.objects.all()
    serializer_class = VueloSerializer
    lookup_field = 'id'

class AeropuertoListView(generics.ListAPIView):
    queryset = Aeropuerto.objects.all()
    serializer_class = AeropuertoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['codigo', 'nombre', 'ciudad', 'pais']