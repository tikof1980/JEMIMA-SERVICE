import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedPage from '../../../components/ProtectedPage';
import { apiFetch } from '../../../lib/api';

const COMING_SOON = [
  'Clients', 'Ventes', 'Produits/Services', 'Stock', 'Finance',
  'Rendez-vous', 'Réservations', 'Commandes', 'QR Codes', 'Automatisations', 'Agent IA',
];

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [company, setCompany] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    apiFetch(`/companies/${id}`, { companyId: id })
      .then(setCompany)
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <ProtectedPage>
      {(me) => (
        <main style={{ fontFamily: 'sans-serif', background: '#0f1115', minHeight: '100vh', color: '#fff', padding: '1.25rem' }}>
          <Link href="/command-center" style={{ color: '#9aa0ab', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Command Center
          </Link>

          {error && <p style={{ color: '#f87171', marginTop: '1rem' }}>{error}</p>}

          {company && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.75rem 0' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.3rem' }}>{company.name}</h1>
                  <p style={{ color: '#9aa0ab', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                    {company.sector} — {company.status}
                  </p>
                </div>
                <Link
                  href={`/companies/${id}/edit`}
                  style={{ color: '#6366f1', fontSize: '0.85rem', textDecoration: 'none' }}
                >
                  Modifier
                </Link>
              </div>

              <Link
                href={`/companies/${id}/members`}
                style={{ display: 'block', background: '#171a21', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: '#fff', textDecoration: 'none' }}
              >
                Utilisateurs de l'entreprise →
              </Link>

              <h3 style={{ fontSize: '0.9rem', color: '#9aa0ab' }}>Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {COMING_SOON.map((label) => (
                  <div
                    key={label}
                    style={{ background: '#171a21', borderRadius: 8, padding: '0.6rem', opacity: 0.6 }}
                  >
                    <div style={{ fontSize: '0.85rem' }}>{label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Bientôt disponible</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      )}
    </ProtectedPage>
  );
}
