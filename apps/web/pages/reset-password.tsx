import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = router.query.token as string;
    try {
      const data = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 400, margin: '0 auto' }}>
      <h1>Réinitialiser le mot de passe</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem' }}
        />
        <button type="submit">Valider</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
