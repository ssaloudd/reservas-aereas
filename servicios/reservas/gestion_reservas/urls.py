from django.urls import path
from .views import ReservaListCreateView, ReservaDetailView

urlpatterns = [
    path('reservas/', ReservaListCreateView.as_view(), name='lista-reservas'),
    path('reservas/<int:pk>/', ReservaDetailView.as_view(), name='detalle-reserva'),
]