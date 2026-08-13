import { useState } from 'react';
import { apiFetch } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
    } catch {
      setMessage('Une erreur est survenue.');
    }
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 400, margin: '0 auto' }}>
      <h1>Mot de passe oublié</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem' }}
        />
        <button type="submit">Envoyer le lien de réinitialisation</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
