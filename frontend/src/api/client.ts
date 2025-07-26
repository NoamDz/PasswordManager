// Simple typed API client for backend REST endpoints
// Covers auth register/login and vault get/post.
// Token is persisted in localStorage and automatically sent in the Authorization header.

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
}

export interface VaultOut {
  blob: string; // base64 string
  version: number;
  updated_at: string;
}

export interface VaultIn {
  blob: string; // base64 string
  version: number;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

let authToken: string | null = (() => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
})();

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`HTTP ${res.status}: ${msg}`.trim());
  }

  return (await res.json()) as T;
}

// ---------------------------
// Auth endpoints
// ---------------------------

export async function register(email: string, password: string): Promise<User> {
  return request<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<Token> {
  const data = await request<Token>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.access_token);
  return data;
}

// ---------------------------
// Vault endpoints
// ---------------------------

export async function getLatestVault(): Promise<VaultOut | null> {
  try {
    return await request<VaultOut>('/api/vault', {
      method: 'GET',
    });
  } catch (err) {
    if ((err as Error).message.includes('404')) return null;
    throw err;
  }
}

export async function saveVault(input: VaultIn): Promise<VaultOut> {
  return request<VaultOut>('/api/vault', {
    method: 'POST',
    body: JSON.stringify(input),
  });
} 