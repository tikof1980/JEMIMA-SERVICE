import { useEffect } from 'react';
import { useRouter } from 'next/router';

// /dashboard redirige vers /command-center, la page principale introduite
// en Phase 4. Conservé pour ne casser aucun lien existant.
export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/command-center');
  }, []);
  return null;
}
