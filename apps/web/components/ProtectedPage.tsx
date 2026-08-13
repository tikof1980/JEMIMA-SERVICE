import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { getToken, apiFetch } from '../lib/api';

// Protection frontend : redirige vers /login si non connecté. Ceci est un
// confort UX uniquement — la vraie protection est côté backend (guards
// JwtAuthGuard / PermissionsGuard), jamais uniquement ici.
export default function ProtectedPage({ children }: { children: (me: any) => ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    apiFetch('/auth/me')
      .then(setMe)
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ fontFamily: 'sans-serif', padding: '2rem' }}>Chargement...</p>;
  if (!me) return null;
  return <>{children(me)}</>;
}
