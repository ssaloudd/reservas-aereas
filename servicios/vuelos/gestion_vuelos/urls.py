from django.urls import path
from .views import BusquedaVuelosView, VueloDetailView, AeropuertoListView

urlpatterns = [
    path('vuelos/', BusquedaVuelosView.as_view(), name='busqueda-vuelos'),
    path('vuelos/<int:id>/', VueloDetailView.as_view(), name='detalle-vuelo'),
    path('aeropuertos/', AeropuertoListView.as_view(), name='lista-aeropuertos'),
]