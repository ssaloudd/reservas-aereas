"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifySession, logout, updateUserProfile } from '@/lib/auth'; // Importamos updateUserProfile
import type { UserProfile } from '@/lib/auth';
import Link from 'next/link';

export default function UserProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Nuevo estado para controlar si se está editando
  const [formData, setFormData] = useState<UserProfile | null>(null); // Estado para el formulario de edición
  const [updateMessage, setUpdateMessage] = useState<string | null>(null); // Mensaje de éxito/error de actualización

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      const profile = await verifySession();
      if (!profile) {
        router.push('/auth/login');
        return;
      }
      setUserProfile(profile);
      setFormData(profile); // Inicializa el formulario con los datos actuales del perfil
      setLoading(false);
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setUpdateMessage(null); // Limpiar mensajes al cambiar de modo
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...(prevData as UserProfile), // Asegurarse de que prevData no sea null
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage(null);
    if (!formData || !userProfile) return;

    try {
      // Llamar a la función de actualización de la API
      const updatedProfile = await updateUserProfile(userProfile.id, formData);
      setUserProfile(updatedProfile);
      setIsEditing(false); // Salir del modo de edición
      setUpdateMessage('Perfil actualizado exitosamente.');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setUpdateMessage(`Error al actualizar: ${errorMessages}`);
      } else {
        setUpdateMessage('Error al actualizar el perfil. Inténtalo de nuevo.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-lg">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Link href="/auth/login" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver al Login
        </Link>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-lg">No se pudo cargar el perfil del usuario.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-300">
        <h1 className="text-4xl font-extrabold text-slate-900">Mi Perfil</h1>
        <Link href="/vuelos" className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
          Volver
        </Link>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto border border-slate-200">
        {updateMessage && (
          <div className={`p-3 mb-4 rounded-lg text-center ${updateMessage.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {updateMessage}
          </div>
        )}

        {!isEditing ? (
          // Modo de visualización
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <p className="text-slate-700"><span className="font-semibold">Usuario:</span> {userProfile.username}</p>
              <p className="text-slate-700"><span className="font-semibold">Email:</span> {userProfile.email}</p>
              <p className="text-slate-700"><span className="font-semibold">Nombre:</span> {userProfile.first_name || 'N/A'}</p>
              <p className="text-slate-700"><span className="font-semibold">Apellido:</span> {userProfile.last_name || 'N/A'}</p>
              <p className="text-slate-700"><span className="font-semibold">Teléfono:</span> {userProfile.telefono || 'N/A'}</p>
              <p className="text-slate-700"><span className="font-semibold">Fecha Nacimiento:</span> {userProfile.fecha_nacimiento || 'N/A'}</p>
              <p className="text-slate-700 col-span-1 sm:col-span-2"><span className="font-semibold">Dirección:</span> {userProfile.direccion || 'N/A'}</p>
            </div>
            <div className="text-center">
              <button
                onClick={handleEditToggle}
                className="px-8 py-2.5 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Actualizar Datos
              </button>
            </div>
          </div>
        ) : (
          // Modo de edición (formulario)
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  name="username"
                  value={formData?.username || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                  disabled // Username generalmente no se edita
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData?.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData?.first_name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData?.last_name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData?.telefono || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData?.fecha_nacimiento || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <textarea
                  name="direccion"
                  value={formData?.direccion || ''}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                type="submit"
                className="px-8 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-8 py-2.5 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
