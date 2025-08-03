'use client';
import { useEffect } from 'react';
import { verifySession } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
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

  return <div>Contenido protegido</div>;
}