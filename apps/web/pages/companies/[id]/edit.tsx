import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedPage from '../../../components/ProtectedPage';
import { apiFetch } from '../../../lib/api';

export default function EditCompanyPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/companies/${id}`, { companyId: id }).then(setForm).catch((e) => setError(e.message));
  }, [id]);

  function set(field: string, value: string) {
    setForm((f: any) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/companies/${id}`, {
        method: 'PATCH',
        companyId: id,
        body: JSON.stringify({
          name: form.name, description: form.description, phone: form.phone,
          whatsapp: form.whatsapp, email: form.email, address: form.address,
          city: form.city, country: form.country,
        }),
      });
      router.push(`/companies/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedPage>
      {() => (
        <main style={{ fontFamily: 'sans-serif', padding: '1.5rem', maxWidth: 480, margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.2rem' }}>Modifier l'entreprise</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {form && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input value={form.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="Nom" />
              <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Description" />
              <input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="Téléphone" />
              <input value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} placeholder="WhatsApp" />
              <input value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="Email" />
              <input value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Adresse" />
              <input value={form.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="Ville" />
              <input value={form.country || ''} onChange={(e) => set('country', e.target.value)} placeholder="Pays" />
              <button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </form>
          )}
        </main>
      )}
    </ProtectedPage>
  );
}
