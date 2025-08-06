"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getFlights } from '@/lib/api/client';
import { verifySession, logout } from '@/lib/auth';
import type { UserProfile } from '@/lib/auth';
import Link from 'next/link'; // Importar Link para la navegación

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

interface Vuelo {
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

export default function VuelosPage() {
  const [flights, setFlights] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [origenFilter, setOrigenFilter] = useState('');
  const [destinoFilter, setDestinoFilter] = useState('');
  const [fechaFilter, setFechaFilter] = useState('');

  const fetchFlights = async (filters: { origen?: string; destino?: string; fecha?: string } = {}) => {
    setLoading(true);
    setError(null);
    const profile = await verifySession();
    if (!profile) {
      router.push('/auth/login');
      return;
    }
    setUserProfile(profile);

    try {
      const data = await getFlights(filters);
      setFlights(data);
    } catch (err: any) {
      console.error('Error fetching flights:', err);
      setError('No se pudieron cargar los vuelos. Inténtalo de nuevo más tarde.');
      if (err.response && err.response.status === 401) {
        logout();
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights({
      origen: origenFilter,
      destino: destinoFilter,
      fecha: fechaFilter,
    });
  };

  const handleClearFilters = () => {
    setOrigenFilter('');
    setDestinoFilter('');
    setFechaFilter('');
    fetchFlights({});
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleManageAccount = () => {
    router.push('/auth/profile');
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-300">
        <h1 className="text-4xl font-extrabold text-sky-700">SABJ Air</h1>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-bold shadow-md hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            aria-label="Opciones de usuario"
          >
            {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
              <button
                onClick={handleManageAccount}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Gestionar cuenta
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="mb-8 text-center">
        <img
          src="https://concepto.de/wp-content/uploads/2023/01/avion.jpg"
          alt="Avión de SABJ Air"
          className="w-full h-auto rounded-xl shadow-lg object-cover max-h-80"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x300/ADD8E6/000000?text=SABJ+Air'; }}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Filtrar Vuelos</h2>
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="origen" className="block text-sm font-medium text-slate-700 mb-1">Origen (Código IATA)</label>
            <input
              type="text"
              id="origen"
              value={origenFilter}
              onChange={(e) => setOrigenFilter(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Ej: UIO"
            />
          </div>
          <div>
            <label htmlFor="destino" className="block text-sm font-medium text-slate-700 mb-1">Destino (Código IATA)</label>
            <input
              type="text"
              id="destino"
              value={destinoFilter}
              onChange={(e) => setDestinoFilter(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Ej: BOG"
            />
          </div>
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 mb-1">Fecha (AAAA-MM-DD)</label>
            <input
              type="date"
              id="fecha"
              value={fechaFilter}
              onChange={(e) => setFechaFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="md:col-span-3 flex justify-end gap-4">
            <button
              type="submit"
              className="px-8 py-2.5 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Filtrar Vuelos
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-8 py-2.5 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Quitar Filtros
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-slate-700 text-lg">Cargando vuelos...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg mt-10 p-4 bg-red-100 rounded-lg shadow">
          {error}
        </div>
      ) : flights.length === 0 ? (
        <div className="text-center text-slate-600 text-lg mt-10 p-4 bg-white rounded-lg shadow">
          No hay vuelos disponibles que coincidan con los criterios.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((vuelo) => (
            <div key={vuelo.id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-bold text-sky-700 mb-2">Vuelo a {vuelo.destino.ciudad}</h2>
              <p className="text-slate-800 mb-1">
                <span className="font-semibold">Aerolínea:</span> {vuelo.aerolinea.nombre} ({vuelo.aerolinea.codigo})
              </p>
              <p className="text-slate-800 mb-1">
                <span className="font-semibold">Origen:</span> {vuelo.origen.ciudad} ({vuelo.origen.codigo})
              </p>
              <p className="text-slate-800 mb-1">
                <span className="font-semibold">Destino:</span> {vuelo.destino.ciudad} ({vuelo.destino.codigo})
              </p>
              <p className="text-slate-800 mb-1">
                <span className="font-semibold">Salida:</span> {new Date(vuelo.fecha_salida).toLocaleString()}
              </p>
              <p className="text-slate-800 mb-1">
                <span className="font-semibold">Llegada:</span> {new Date(vuelo.fecha_llegada).toLocaleString()}
              </p>
              <p className="text-slate-800 mb-1">
                <span className="font-semibold">Duración:</span> {vuelo.duracion}
              </p>
              <p className="text-slate-800 mb-1">
                <span className="font-semibold">Asientos:</span> {vuelo.asientos_disponibles}
              </p>
              <p className="text-2xl font-bold text-green-600 mt-3">
                Precio: ${parseFloat(vuelo.precio_base).toFixed(2)}
              </p>
              {/* Botón de Reservar ahora */}
              <div className="mt-4 text-center">
                <Link href={`/reservar/${vuelo.id}`} className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Reservar ahora
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
