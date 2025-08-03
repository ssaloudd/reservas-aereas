import client from './api/client';
import Cookies from 'js-cookie';

interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  username: string;
  email: string;
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

export const verifySession = async (): Promise<boolean> => {
  try {
    const response = await client.get('usuarios/api/auth/verify-token/');
    return response.status === 200;
  } catch {
    return false;
  }
};
