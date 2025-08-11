"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Importamos el componente Link
import { login } from '@/lib/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login({ username, password });
      console.log('Login successful:', response);
      router.push('/dashboard'); // Redirige al dashboard o a otra página
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        // Error de la API (ej: 401 Unauthorized)
        setError(err.response.data.detail || 'Error de inicio de sesión. Por favor, verifica tus credenciales.');
      } else {
        // Error de red u otro
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal para centrar el formulario vertical y horizontalmente
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md transition-all duration-300 transform hover:scale-[1.01]">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-slate-900">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base transition-colors"
              required
            />
          </div>
          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-sm font-medium rounded-lg text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>
        
        {/* Enlace para el registro */}
        <div className="mt-6 text-center text-sm text-slate-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/register" className="font-semibold text-sky-600 hover:text-sky-800 transition-colors">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
