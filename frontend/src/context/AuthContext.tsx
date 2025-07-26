import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from '../api/client';

interface AuthState {
  user: api.User | null;
  token: string | null;
  status: 'idle' | 'loading';
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [token, setToken] = useState<string | null>(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null));
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  // verify token by retrieving vault list or simply treat token as valid for now
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        // A "me" endpoint would be nicer; for now try getLatestVault (ignoring result)
        await api.getLatestVault();
      } catch (e) {
        console.warn('Token invalid – logging out', e);
        handleLogout();
      }
    })();
  }, []);

  function handleLogout() {
    setUser(null);
    setToken(null);
    api.setAuthToken(null);
    localStorage.removeItem('token');
  }

  async function handleLogin(email: string, password: string) {
    setStatus('loading');
    try {
      const { access_token } = await api.login(email, password);
      api.setAuthToken(access_token);
      setToken(access_token);
      // Ideally call /me; backend not yet implemented so we leave user null.
    } finally {
      setStatus('idle');
    }
  }

  async function handleRegister(email: string, password: string) {
    setStatus('loading');
    try {
      await api.register(email, password);
      await handleLogin(email, password);
    } finally {
      setStatus('idle');
    }
  }

  const value: AuthState = {
    user,
    token,
    status,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    // We cannot use navigate hook here outside router; this component should be used inside Router context.
    // We'll return null; redirect logic will live in route definitions.
    return null;
  }
  return <>{children}</>;
} 