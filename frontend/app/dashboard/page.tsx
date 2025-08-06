"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirige directamente a la página de vuelos después de que la sesión sea verificada
    router.push('/vuelos');
  }, [router]);

  // Puedes mostrar un spinner o un mensaje de carga mientras se redirige
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <p className="text-slate-700 text-lg">Redirigiendo a vuelos...</p>
    </div>
  );
}