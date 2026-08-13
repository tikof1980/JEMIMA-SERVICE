import { useEffect, useState } from 'react';
import ProtectedPage from '../components/ProtectedPage';
import { apiFetch, getActiveCompanyId, setActiveCompanyId, clearToken } from '../lib/api';

function CompanySelector({ companies }: { companies: { companyId: string; companyName: string; role: string }[] }) {
  const [active, setActive] = useState(getActiveCompanyId());

  useEffect(() => {
    if (!active && companies.length > 0) {
      setActiveCompanyId(companies[0].companyId);
      setActive(companies[0].companyId);
    }
  }, [companies]);

  if (companies.length <= 1) return null;

  return (
    <select
      value={active || ''}
      onChange={(e) => {
        setActiveCompanyId(e.target.value);
        setActive(e.target.value);
        window.location.reload();
      }}
    >
      {companies.map((c) => (
        <option key={c.companyId} value={c.companyId}>
          {c.companyName} ({c.role})
        </option>
      ))}
    </select>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedPage>
      {(me) => (
        <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>JEMIMA COMMAND CENTER</h1>
            <button
              onClick={() => {
                clearToken();
                window.location.href = '/login';
              }}
            >
              Déconnexion
            </button>
          </div>

          <p>
            Connecté en tant que <strong>{me.fullName}</strong> ({me.email})
            {me.isSuperAdmin && ' — Super Admin'}
          </p>

          {me.companies?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label>Entreprise active : </label>
              <CompanySelector companies={me.companies} />
            </div>
          )}

          <p style={{ marginTop: '2rem', color: '#666' }}>
            Le tableau de bord transverse (ventes, revenus, rendez-vous...) sera implémenté
            en Phase 5.
          </p>
        </main>
      )}
    </ProtectedPage>
  );
}
