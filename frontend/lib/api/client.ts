import axios from 'axios';
import Cookies from 'js-cookie';

// Interfaz para la aerolínea
export interface Aerolinea {
  codigo: string;
  nombre: string;
}

// Interfaz para el aeropuerto
export interface Aeropuerto {
  codigo: string;
  nombre: string;
  ciudad: string;
  pais: string;
}

// Interfaz para el vuelo
export interface Vuelo {
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

// Interfaz para el pasajero
export interface Pasajero {
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
}

// Interfaz para la reserva
export interface Reserva {
  id: number;
  codigo_reserva: string;
  vuelo_id: number;
  fecha_reserva: string;
  estado: 'P' | 'C' | 'X';
  asientos: number;
  precio_total: string;
  pasajeros: Pasajero[];
}

const client = axios.create({
  // URL base del API Gateway a través de NGINX
  baseURL: 'http://localhost/api/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a las solicitudes
client.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si el token es inválido
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default client;

// Función para obtener vuelos, ahora acepta un objeto de filtros
export const getFlights = async (filters: { origen?: string; destino?: string; fecha?: string } = {}) => {
  try {
    let url = 'vuelos/api/vuelos/'; // URL base para el API Gateway

    // Construir los parámetros de consulta
    const params = new URLSearchParams();
    if (filters.origen) {
      params.append('origen', filters.origen);
    }
    if (filters.destino) {
      params.append('destino', filters.destino);
    }
    if (filters.fecha) {
      params.append('fecha', filters.fecha);
    }

    // Añadir los parámetros a la URL si existen
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
};

// Nueva función para obtener detalles de un solo vuelo
export const getFlightDetails = async (flightId: number) => {
  try {
    const response = await client.get(`vuelos/api/vuelos/${flightId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching flight details for ID ${flightId}:`, error);
    throw error;
  }
};

// Nueva función para crear una reserva
export const createReservation = async (reservationData: any) => {
  try {
    const response = await client.post('reservas/api/reservas/', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

//Obtiene todas las reservas del usuario actual.
export const getReservations = async (): Promise<Reserva[]> => {
  try {
    const response = await client.get('reservas/api/reservas/');
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

//Obtiene los detalles de una reserva específica por ID.
export const getReservationDetails = async (reservaId: number): Promise<Reserva> => {
  try {
    const response = await client.get(`reservas/api/reservas/${reservaId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reservation details for ID ${reservaId}:`, error);
    throw error;
  }
};

//Cancela una reserva (actualiza su estado a 'X')
export const cancelReservation = async (reservaId: number): Promise<void> => {
  try {
    // Tu backend usa el método DELETE para cambiar el estado a 'X'
    await client.delete(`reservas/api/reservas/${reservaId}/`);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};
