import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedPage from '../../../components/ProtectedPage';
import { apiFetch } from '../../../lib/api';

export default function CompanyMembersPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState('employee');
  const [error, setError] = useState('');

  function load() {
    if (!id) return;
    apiFetch(`/companies/${id}/members`, { companyId: id }).then(setMembers).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch(`/companies/${id}/members`, {
        method: 'POST',
        companyId: id,
        body: JSON.stringify({ email, roleName }),
      });
      setEmail('');
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRemove(membershipId: string) {
    await apiFetch(`/companies/${id}/members/${membershipId}`, { method: 'DELETE', companyId: id });
    load();
  }

  return (
    <ProtectedPage>
      {() => (
        <main style={{ fontFamily: 'sans-serif', padding: '1.5rem', maxWidth: 500, margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.2rem' }}>Utilisateurs de l'entreprise</h1>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {members.map((m) => (
              <li key={m.membershipId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                <span>{m.fullName} ({m.email}) — {m.role} — {m.status}</span>
                <button onClick={() => handleRemove(m.membershipId)}>Retirer</button>
              </li>
            ))}
          </ul>

          <h3 style={{ fontSize: '1rem', marginTop: '1.5rem' }}>Ajouter un membre existant</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input placeholder="Email du compte JEMIMA SERVICE" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <select value={roleName} onChange={(e) => setRoleName(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employé</option>
            </select>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Ajouter</button>
          </form>
        </main>
      )}
    </ProtectedPage>
  );
}
