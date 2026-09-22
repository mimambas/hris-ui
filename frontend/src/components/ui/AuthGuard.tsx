'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const logout = useAuthStore((state) => state.logout);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = localStorage.getItem('access_token');
    if (!token) {
      logout();
      return;
    }
    api.get('/auth/me')
      .then((response) => hydrate(response.data))
      .catch(() => logout());
  }, [hydrate, logout]);

  useEffect(() => {
    if (hydrated && !isAuthenticated && pathname !== '/login') router.replace('/login');
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen bg-surface-soft flex items-center justify-center"><div className="flex items-center gap-3 text-sm text-muted"><span className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />Loading your workspace…</div></div>;
  }

  return <>{children}</>;
}
