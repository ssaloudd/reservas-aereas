import client from './api/client';
import Cookies from 'js-cookie';

interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  username: string;
  email: string;
}

// Nueva interfaz para el perfil del usuario (basada en tu modelo Usuario)
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
}

export const login = async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
  try {
    const response = await client.post('usuarios/api/auth/login/', credentials);
    Cookies.set('access_token', response.data.access, { expires: 1 });
    Cookies.set('refresh_token', response.data.refresh, { expires: 7 });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Nueva función para el registro de usuarios
export const register = async (userData: any): Promise<any> => {
  try {
    // Envía los datos al endpoint de registro
    const response = await client.post('usuarios/api/auth/registro/', userData);
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};


export const logout = (): void => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  window.location.href = '/auth/login';
};

// Modificación: Ahora verifySession devuelve el perfil del usuario o null
export const verifySession = async (): Promise<UserProfile | null> => {
  try {
    // Llama al endpoint de perfil del usuario. Requiere un JWT válido.
    const response = await client.get('usuarios/api/auth/perfil/');
    return response.data as UserProfile; // Devuelve los datos del perfil
  } catch (error) {
    console.error('Error verifying session or fetching user profile:', error);
    // El interceptor de Axios ya maneja el 401, aquí solo aseguramos null para otros errores
    return null;
  }
};

// Nueva función para actualizar el perfil del usuario
export const updateUserProfile = async (userId: number, userData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    // El endpoint de perfil es `usuarios/api/auth/perfil/`
    // y el PUT/PATCH se aplica al usuario autenticado (no necesita ID en la URL para DRF)
    const response = await client.patch('usuarios/api/auth/perfil/', userData);
    return response.data as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};