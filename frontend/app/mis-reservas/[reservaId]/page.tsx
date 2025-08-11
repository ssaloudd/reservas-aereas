"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getReservationDetails, getFlightDetails, type Reserva, type Vuelo } from '@/lib/api/client';
import { verifySession } from '@/lib/auth';
import Link from 'next/link';

export default function ReservaDetallePage() {
  const router = useRouter();
  const [reservaId, setReservaId] = useState<string | null>(null);
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [vuelo, setVuelo] = useState<Vuelo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extraer el ID de la reserva de la URL
    const pathSegments = window.location.pathname.split('/');
    const idFromPath = pathSegments[pathSegments.length - 1];

    if (idFromPath && !isNaN(parseInt(idFromPath))) {
      setReservaId(idFromPath);
    } else {
      setError('ID de reserva no válido en la URL.');
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!reservaId) return;

    const fetchReserva = async () => {
      setLoading(true);
      setError(null);
      const profile = await verifySession();
      if (!profile) {
        router.push('/auth/login');
        return;
      }

      try {
        const reservaData = await getReservationDetails(parseInt(reservaId));
        // AÑADIDO: Log para ver los datos crudos que llegan de la API
        console.log('Datos de la reserva recibidos:', reservaData);
        setReserva(reservaData);

        if (reservaData?.vuelo_id) {
          const vueloData = await getFlightDetails(reservaData.vuelo_id);
          setVuelo(vueloData);
        }
      } catch (err) {
        console.error('Error fetching reservation details:', err);
        setError('No se pudo cargar los detalles de la reserva.');
      } finally {
        setLoading(false);
      }
    };
    fetchReserva();
  }, [reservaId, router]);

  const getStatusText = (estado: 'P' | 'C' | 'X' | null | undefined) => {
    if (!estado) {
      return 'Estado desconocido';
    }
    switch (estado) {
      case 'P':
        return 'Pendiente';
      case 'C':
        return 'Confirmada';
      case 'X':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  if (loading || !reservaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-lg">Cargando detalles de la reserva...</p>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <p className="text-red-600 text-lg mb-4">{error || 'Reserva no encontrada.'}</p>
        <Link href="/mis-reservas" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver a Mis Reservas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-300">
        <h1 className="text-4xl font-extrabold text-slate-900">Detalles de la Reserva</h1>
        <Link href="/mis-reservas" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver a Mis Reservas
        </Link>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl mx-auto border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Información de la Reserva</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-slate-700">
          <p>
            <span className="font-semibold">Código de Reserva:</span> {reserva.codigo_reserva || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Estado:</span> {getStatusText(reserva.estado)}
          </p>
          <p className="text-2xl font-bold text-green-600 col-span-full">
            Precio Total: ${reserva.precio_total ? parseFloat(reserva.precio_total).toFixed(2) : 'N/A'}
          </p>
        </div>

        <hr className="my-6 border-slate-200" />
        
        {vuelo ? (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Detalles del Vuelo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-slate-700">
              <p>
                <span className="font-semibold">Origen:</span> {vuelo.origen?.ciudad} ({vuelo.origen?.codigo})
              </p>
              <p>
                <span className="font-semibold">Destino:</span> {vuelo.destino?.ciudad} ({vuelo.destino?.codigo})
              </p>
              <p>
                <span className="font-semibold">Salida:</span> {vuelo.fecha_salida ? new Date(vuelo.fecha_salida).toLocaleString() : 'N/A'}
              </p>
              <p>
                <span className="font-semibold">Llegada:</span> {vuelo.fecha_llegada ? new Date(vuelo.fecha_llegada).toLocaleString() : 'N/A'}
              </p>
            </div>
            <hr className="my-6 border-slate-200" />
          </>
        ) : (
          <p className="text-center text-slate-600 mb-6">Cargando detalles del vuelo...</p>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mb-4">Pasajeros</h2>
        <div className="space-y-4">
          {reserva.pasajeros?.length > 0 ? (
            reserva.pasajeros.map((pasajero, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-lg font-semibold text-slate-900">Pasajero {index + 1}: {pasajero.nombre} {pasajero.apellido}</p>
                <p className="text-sm text-slate-600">Tipo de Documento: {pasajero.tipo_documento}</p>
                <p className="text-sm text-slate-600">Número de Documento: {pasajero.numero_documento}</p>
                <p className="text-sm text-slate-600">Fecha de Nacimiento: {pasajero.fecha_nacimiento}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-600">No hay pasajeros en esta reserva.</p>
          )}
        </div>
      </div>
    </div>
  );
}
