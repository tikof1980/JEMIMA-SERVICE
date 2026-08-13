const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jemima_token');
}

export function setToken(token: string) {
  localStorage.setItem('jemima_token', token);
}

export function clearToken() {
  localStorage.removeItem('jemima_token');
  localStorage.removeItem('jemima_active_company_id');
}

export function getActiveCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jemima_active_company_id');
}

export function setActiveCompanyId(companyId: string) {
  localStorage.setItem('jemima_active_company_id', companyId);
}

interface ApiOptions extends RequestInit {
  withCompanyContext?: boolean;
}

// Client API centralisé : ajoute automatiquement le token JWT et,
// si demandé, l'en-tête X-Company-Id (résolu côté serveur, jamais fiable
// tel quel, mais nécessaire pour indiquer QUELLE entreprise consulter).
export async function apiFetch(path: string, options: ApiOptions = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.withCompanyContext) {
    const companyId = getActiveCompanyId();
    if (companyId) headers['X-Company-Id'] = companyId;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expirée');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'Une erreur est survenue');
  }
  return data;
}
