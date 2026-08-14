import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedPage from '../../components/ProtectedPage';
import { apiFetch } from '../../lib/api';

const SECTORS = [
  { value: 'travel_agency', label: 'Agence de voyage' },
  { value: 'clothing_boutique', label: 'Boutique de vêtements' },
  { value: 'hair_salon', label: 'Salon de coiffure' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'service', label: 'Service' },
  { value: 'custom', label: 'Autre / personnalisé' },
];

function slugTenantCode(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', sector: 'custom', description: '', phone: '', whatsapp: '',
    email: '', address: '', city: '', country: '', ownerEmail: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const company = await apiFetch('/companies', {
        method: 'POST',
        body: JSON.stringify({ ...form, tenantCode: slugTenantCode(form.name) }),
      });
      router.push(`/companies/${company.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedPage>
      {(me) =>
        !me.isSuperAdmin ? (
          <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
            <p>Réservé au Super Admin.</p>
          </main>
        ) : (
          <main style={{ fontFamily: 'sans-serif', padding: '1.5rem', maxWidth: 480, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.2rem' }}>Nouvelle entreprise</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input placeholder="Nom *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <select value={form.sector} onChange={(e) => set('sector', e.target.value)}>
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <textarea placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} />
              <input placeholder="Téléphone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              <input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              <input placeholder="Adresse" value={form.address} onChange={(e) => set('address', e.target.value)} />
              <input placeholder="Ville" value={form.city} onChange={(e) => set('city', e.target.value)} />
              <input placeholder="Pays" value={form.country} onChange={(e) => set('country', e.target.value)} />
              <input
                placeholder="Email du propriétaire (optionnel, doit déjà avoir un compte)"
                value={form.ownerEmail}
                onChange={(e) => set('ownerEmail', e.target.value)}
              />
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer l’entreprise'}</button>
            </form>
          </main>
        )
      }
    </ProtectedPage>
  );
}
