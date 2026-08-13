import { useEffect, useState } from 'react';
import ProtectedPage from '../../components/ProtectedPage';
import { apiFetch } from '../../lib/api';

export default function UsersPage() {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/companies/me', { withCompanyContext: false }).then(setCompanies).catch(() => {});
  }, []);

  return (
    <ProtectedPage>
      {(me) => (
        <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
          <h1>Gestion des utilisateurs</h1>
          <p style={{ color: '#666' }}>
            Réservé aux rôles disposant de la permission <code>users.view</code>. La liste,
            l'invitation et la modification des employés seront branchées sur
            /invitations et /memberships lors de la finalisation de l'interface.
          </p>
          <h3>Vos entreprises</h3>
          <ul>
            {companies.map((c) => (
              <li key={c.id}>
                {c.name} — rôle : {c.role}
              </li>
            ))}
          </ul>
        </main>
      )}
    </ProtectedPage>
  );
}
