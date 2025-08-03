import axios from 'axios';
import Cookies from 'js-cookie';

const client = axios.create({
  // URL base del API Gateway
  baseURL: 'http://localhost:8003/api/', 
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

export default client;
