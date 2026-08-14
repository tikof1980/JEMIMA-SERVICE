import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedPage from '../components/ProtectedPage';
import { apiFetch, clearToken } from '../lib/api';

const statusLabel: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archivée',
};

const statusColor: Record<string, string> = {
  active: '#22c55e',
  inactive: '#f59e0b',
  archived: '#6b7280',
};

function CompanyCard({ company }: { company: any }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      style={{
        display: 'block',
        background: '#171a21',
        borderRadius: 12,
        padding: '1rem',
        marginBottom: '0.75rem',
        textDecoration: 'none',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{company.name}</strong>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
            borderRadius: 6,
            background: statusColor[company.status] || '#6b7280',
            color: '#0f1115',
            fontWeight: 600,
          }}
        >
          {statusLabel[company.status] || company.status}
        </span>
      </div>
      <p style={{ color: '#9aa0ab', fontSize: '0.85rem', margin: '0.25rem 0 0.5rem' }}>
        {company.sector} {company.role ? `— rôle : ${company.role}` : ''}
      </p>
      <span style={{ color: '#6366f1', fontSize: '0.85rem' }}>Ouvrir →</span>
    </Link>
  );
}

export default function CommandCenterPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/companies/me')
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedPage>
      {(me) => (
        <main style={{ fontFamily: 'sans-serif', background: '#0f1115', minHeight: '100vh', color: '#fff', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.3rem' }}>JEMIMA COMMAND CENTER</h1>
              <p style={{ color: '#9aa0ab', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                {me.fullName} {me.isSuperAdmin && '— Super Admin'}
              </p>
            </div>
            <button
              onClick={() => {
                clearToken();
                window.location.href = '/login';
              }}
              style={{ background: 'transparent', color: '#9aa0ab', border: '1px solid #2a2f3a', borderRadius: 6, padding: '0.4rem 0.7rem' }}
            >
              Déconnexion
            </button>
          </div>

          {/* Vue globale — indicateurs disponibles après activation des modules métier */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <StatCard label="Entreprises" value={String(companies.length)} />
            <StatCard label="Actives" value={String(companies.filter((c) => c.status === 'active').length)} />
            <StatCard label="Ventes" value="Données disponibles après activation du module" small />
            <StatCard label="Rendez-vous" value="Données disponibles après activation du module" small />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Entreprises</h2>
            {me.isSuperAdmin && (
              <Link href="/companies/new" style={{ color: '#6366f1', fontSize: '0.85rem', textDecoration: 'none' }}>
                + Nouvelle entreprise
              </Link>
            )}
          </div>

          {loading && <p style={{ color: '#9aa0ab' }}>Chargement...</p>}
          {!loading && companies.length === 0 && (
            <p style={{ color: '#9aa0ab' }}>Aucune entreprise pour le moment.</p>
          )}
          {companies.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </main>
      )}
    </ProtectedPage>
  );
}

function StatCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div style={{ background: '#171a21', borderRadius: 10, padding: '0.75rem' }}>
      <div style={{ color: '#9aa0ab', fontSize: '0.75rem' }}>{label}</div>
      <div style={{ fontSize: small ? '0.7rem' : '1.4rem', fontWeight: small ? 400 : 700, color: small ? '#6b7280' : '#fff' }}>
        {value}
      </div>
    </div>
  );
}
