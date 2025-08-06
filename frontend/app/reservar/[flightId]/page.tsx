"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFlightDetails, createReservation } from '@/lib/api/client';
import { verifySession } from '@/lib/auth';
import type { UserProfile } from '@/lib/auth';
import Link from 'next/link';

// Definiciones de tipos para los datos del vuelo y pasajeros
interface Aerolinea {
  codigo: string;
  nombre: string;
}

interface Aeropuerto {
  codigo: string;
  nombre: string;
  ciudad: string;
  pais: string;
}

interface VueloDetalle {
  id: number;
  codigo_vuelo: string;
  aerolinea: Aerolinea;
  origen: Aeropuerto;
  destino: Aeropuerto;
  fecha_salida: string;
  fecha_llegada: string;
  duracion: string;
  asientos_disponibles: number;
  precio_base: string;
}

interface PasajeroData {
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
}

interface ReservaFormData {
  vuelo_id: number;
  asientos: number;
  pasajeros: PasajeroData[];
}

// El componente ya no recibe 'params' como prop directamente
export default function ReserveFlightPage() {
  const router = useRouter();
  // El flightId se obtendrá de la URL dentro del useEffect
  const [flightId, setFlightId] = useState<string | null>(null); 
  const [vuelo, setVuelo] = useState<VueloDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [numAsientos, setNumAsientos] = useState(1);
  const [pasajeros, setPasajeros] = useState<PasajeroData[]>([
    { nombre: '', apellido: '', tipo_documento: '', numero_documento: '', fecha_nacimiento: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Extraer flightId de la URL pathname
    const pathSegments = window.location.pathname.split('/');
    const idFromPath = pathSegments[pathSegments.length - 1]; // El último segmento debería ser el ID
    
    if (idFromPath && !isNaN(parseInt(idFromPath))) {
      setFlightId(idFromPath);
    } else {
      setError('ID de vuelo no válido en la URL.');
      setLoading(false);
      return;
    }
  }, []); // Se ejecuta solo una vez al montar para obtener el ID de la URL

  useEffect(() => {
    // Solo intentar cargar datos si flightId ya está disponible
    if (!flightId) {
      setLoading(true); // Mantener el estado de carga mientras se resuelve flightId
      return;
    }

    const fetchFlightAndUser = async () => {
      setLoading(true);
      setError(null);
      const profile = await verifySession();
      if (!profile) {
        router.push('/auth/login');
        return;
      }
      setUserProfile(profile);

      try {
        const flightData = await getFlightDetails(parseInt(flightId));
        setVuelo(flightData);
        // Inicializar el primer pasajero con datos del usuario si existen
        setPasajeros([{
          nombre: profile.first_name || '',
          apellido: profile.last_name || '',
          tipo_documento: '', // Asumir que esto se llenará manualmente o se obtendrá de otro lado
          numero_documento: '',
          fecha_nacimiento: profile.fecha_nacimiento || '',
        }]);
      } catch (err: any) {
        console.error('Error fetching flight details:', err);
        setError('No se pudo cargar los detalles del vuelo.');
        if (err.response && err.response.status === 401) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFlightAndUser();
  }, [flightId, router]); // Ahora depende de flightId (estado local)

  const handleNumAsientosChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNumAsientos = parseInt(e.target.value);
    setNumAsientos(newNumAsientos);
    // Ajustar el número de pasajeros si es necesario
    setPasajeros(prevPasajeros => {
      const newPasajeros = [...prevPasajeros];
      while (newPasajeros.length < newNumAsientos) {
        newPasajeros.push({ nombre: '', apellido: '', tipo_documento: '', numero_documento: '', fecha_nacimiento: '' });
      }
      return newPasajeros.slice(0, newNumAsientos);
    });
  };

  const handlePasajeroChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newPasajeros = [...pasajeros];
    newPasajeros[index] = { ...newPasajeros[index], [name]: value };
    setPasajeros(newPasajeros);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReservationSuccess(null);
    setIsSubmitting(true);

    if (!vuelo || !userProfile) {
      setError('Datos de vuelo o usuario no disponibles.');
      setIsSubmitting(false);
      return;
    }

    try {
      const reservationData: ReservaFormData = {
        vuelo_id: vuelo.id,
        asientos: numAsientos,
        pasajeros: pasajeros,
      };
      
      const response = await createReservation(reservationData);
      setReservationSuccess(`Reserva exitosa!`);
      // Opcional: redirigir a una página de confirmación o a la lista de reservas
      // router.push('/reservas/confirmacion');
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setError(`Error en la reserva: ${errorMessages}`);
      } else {
        setError('Error al conectar con el servidor para la reserva.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar un estado de carga mientras flightId es null o loading es true
  if (!flightId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-lg">Cargando detalles del vuelo...</p>
      </div>
    );
  }

  if (error && !vuelo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Link href="/vuelos" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver a Vuelos
        </Link>
      </div>
    );
  }

  if (!vuelo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-lg">Vuelo no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-300">
        <h1 className="text-4xl font-extrabold text-slate-900">Reservar Vuelo</h1>
        <Link href="/vuelos" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver a Vuelos
        </Link>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl mx-auto border border-slate-200">
        <h2 className="text-2xl font-bold text-sky-700 mb-4">Detalles del Vuelo: {vuelo.codigo_vuelo}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-slate-700">
          <p><span className="font-semibold">Aerolínea:</span> {vuelo.aerolinea.nombre}</p>
          <p><span className="font-semibold">Origen:</span> {vuelo.origen.ciudad} ({vuelo.origen.codigo})</p>
          <p><span className="font-semibold">Destino:</span> {vuelo.destino.ciudad} ({vuelo.destino.codigo})</p>
          <p><span className="font-semibold">Salida:</span> {new Date(vuelo.fecha_salida).toLocaleString()}</p>
          <p><span className="font-semibold">Llegada:</span> {new Date(vuelo.fecha_llegada).toLocaleString()}</p>
          <p><span className="font-semibold">Asientos Disponibles:</span> {vuelo.asientos_disponibles}</p>
          <p className="text-2xl font-bold text-green-600 col-span-full">Precio Base: ${parseFloat(vuelo.precio_base).toFixed(2)}</p>
        </div>

        <hr className="my-6 border-slate-200" />

        <h2 className="text-2xl font-bold text-slate-800 mb-4">Datos de la Reserva</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="asientos" className="block text-sm font-medium text-slate-700 mb-1">Número de Asientos</label>
            <select
              id="asientos"
              value={numAsientos}
              onChange={handleNumAsientosChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {[...Array(vuelo.asientos_disponibles > 10 ? 10 : vuelo.asientos_disponibles)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Datos de los Pasajeros</h3>
          {pasajeros.map((pasajero, index) => (
            <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-700 mb-3">Pasajero {index + 1}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={pasajero.nombre}
                    onChange={(e) => handlePasajeroChange(index, e)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={pasajero.apellido}
                    onChange={(e) => handlePasajeroChange(index, e)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Documento</label>
                  <select
                    name="tipo_documento"
                    value={pasajero.tipo_documento}
                    onChange={(e) => handlePasajeroChange(index, e)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="DNI">DNI</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="CEDULA">Cédula</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Número Documento</label>
                  <input
                    type="text"
                    name="numero_documento"
                    value={pasajero.numero_documento}
                    onChange={(e) => handlePasajeroChange(index, e)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={pasajero.fecha_nacimiento}
                    onChange={(e) => handlePasajeroChange(index, e)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-sm font-medium rounded-lg text-center">
              {error}
            </div>
          )}
          {reservationSuccess && (
            <div className="p-3 bg-green-100 text-green-700 text-sm font-medium rounded-lg text-center">
              {reservationSuccess}
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando Reserva...' : `Confirmar Reserva ($${(parseFloat(vuelo.precio_base) * numAsientos).toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
