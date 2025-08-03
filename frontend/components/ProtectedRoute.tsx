'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifySession } from '@/lib/auth'; // Cambiado de verifyToken a verifySession

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await verifySession();
      if (!isAuthenticated) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  return <>{children}</>;
}