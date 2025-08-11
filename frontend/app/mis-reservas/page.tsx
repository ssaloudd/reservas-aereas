"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getReservations, getFlightDetails, cancelReservation, type Reserva, type Vuelo } from '@/lib/api/client';
import { verifySession } from '@/lib/auth';
import Link from 'next/link';

// Interfaz para la aerolínea
interface Aerolinea {
  codigo: string;
  nombre: string;
}

// Interfaz para el aeropuerto
interface Aeropuerto {
  codigo: string;
  nombre: string;
  ciudad: string;
  pais: string;
}

// Interfaz que extiende Reserva para incluir los detalles del vuelo
// *** CORRECCIÓN AÑADIDA: Incluir codigo_reserva en la interfaz. ***
interface ReservaConVuelo extends Reserva {
  vuelo?: Vuelo;
  codigo_reserva: string; 
}

export default function MisReservasPage() {
  const [reservas, setReservas] = useState<ReservaConVuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservaToCancelId, setReservaToCancelId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await verifySession();
      if (!profile) {
        router.push('/auth/login');
        return;
      }

      const data = await getReservations();
      const reservationsWithFlightInfo = await Promise.all(data.map(async (reserva) => {
        if (reserva.vuelo_id) {
          try {
            const vuelo = await getFlightDetails(reserva.vuelo_id);
            return { ...reserva, vuelo };
          } catch (flightErr) {
            console.error(`Error fetching flight details for reservation ${reserva.id}:`, flightErr);
            return reserva;
          }
        }
        return reserva;
      }));
      setReservas(reservationsWithFlightInfo);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError('No se pudieron cargar tus reservas. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const handleCancelClick = (reservaId: number) => {
    setReservaToCancelId(reservaId);
    setShowConfirmModal(true);
  };

  const handleConfirmCancelation = async () => {
    if (reservaToCancelId === null) return;
    
    setIsCancelling(true);
    try {
      await cancelReservation(reservaToCancelId);
      
      setStatusMessage({ type: 'success', text: '¡Reserva cancelada exitosamente!' });
      
      // La clave del éxito: Recargamos los datos del servidor para que el front
      // se sincronice con el estado real de la base de datos.
      await fetchReservas();

    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setStatusMessage({ type: 'error', text: 'Hubo un error al cancelar la reserva. Por favor, inténtalo de nuevo.' });
      fetchReservas();
    } finally {
      setIsCancelling(false);
      setReservaToCancelId(null);
      setShowConfirmModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setReservaToCancelId(null);
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'P': return 'Pendiente';
      case 'C': return 'Confirmada';
      case 'X': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'P': return 'text-yellow-600';
      case 'C': return 'text-green-600';
      case 'X': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-lg">Cargando tus reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Link href="/vuelos" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver a Vuelos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-300">
        <h1 className="text-4xl font-extrabold text-slate-900">Mis Reservas</h1>
        <Link href="/vuelos" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver a Vuelos
        </Link>
      </header>
      
      {statusMessage && (
        <div className={`p-4 mb-4 rounded-lg text-white font-bold ${statusMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {statusMessage.text}
        </div>
      )}

      {reservas.length === 0 ? (
        <div className="text-center text-slate-600 text-lg mt-10 p-4 bg-white rounded-lg shadow">
          No tienes ninguna reserva activa.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold text-sky-700 mb-2">Reserva #{reserva.codigo_reserva}</h2>
              {reserva.vuelo ? (
                <p><span className="font-semibold">Ruta:</span> {reserva.vuelo.origen.ciudad} → {reserva.vuelo.destino.ciudad}</p>
              ) : (
                <p className="text-sm text-slate-500">Detalles del vuelo no disponibles.</p>
              )}
              <p>
                <span className="font-semibold">Estado:</span> 
                <span className={`font-bold ${getStatusColor(reserva.estado)}`}> {getStatusText(reserva.estado)}</span>
              </p>
              <p><span className="font-semibold">Asientos:</span> {reserva.asientos}</p>
              <p className="text-2xl font-bold text-green-600 mt-3">Total: ${parseFloat(reserva.precio_total).toFixed(2)}</p>
              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                <Link href={`/mis-reservas/${reserva.id}`} className="block w-full sm:w-auto text-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                  Ver Detalles
                </Link>
                {reserva.estado !== 'X' && (
                  <button
                    onClick={() => handleCancelClick(reserva.id)}
                    className="block w-full sm:w-auto text-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    disabled={isCancelling}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Confirmar Cancelación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                disabled={isCancelling}
              >
                No, volver
              </button>
              <button
                onClick={handleConfirmCancelation}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
