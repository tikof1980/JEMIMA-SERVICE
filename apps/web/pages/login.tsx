import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch, setToken } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>JEMIMA SERVICE</h1>
        <p style={styles.subtitle}>Connexion</p>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={styles.label}>Mot de passe</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <a href="/forgot-password" style={styles.link}>
          Mot de passe oublié ?
        </a>
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f1115',
    fontFamily: 'sans-serif',
  },
  card: {
    background: '#171a21',
    padding: '2rem',
    borderRadius: '12px',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: { color: '#fff', marginBottom: 0, textAlign: 'center' },
  subtitle: { color: '#9aa0ab', textAlign: 'center', marginBottom: '1.5rem' },
  label: { color: '#c7cbd1', fontSize: '0.85rem', marginBottom: '0.25rem' },
  input: {
    padding: '0.6rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #2a2f3a',
    background: '#0f1115',
    color: '#fff',
  },
  button: {
    padding: '0.7rem',
    borderRadius: '6px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: { color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' },
  link: { color: '#8b93a3', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' },
};
