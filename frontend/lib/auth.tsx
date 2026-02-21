'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: 'student' | 'teacher' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (access: string, refresh: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_PATHS = ['/', '/login', '/register'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    const role = localStorage.getItem('user_role') as AuthState['role'];

    setState({
      accessToken: access,
      refreshToken: refresh,
      role: access ? role : null,
      isAuthenticated: !!access,
      isLoading: false,
    });
  }, []);

  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    if (state.isLoading) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!state.isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [state.isLoading, state.isAuthenticated, pathname, router]);

  const login = useCallback(
    (access: string, refresh: string, role: string) => {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_role', role);

      setState({
        accessToken: access,
        refreshToken: refresh,
        role: role as AuthState['role'],
        isAuthenticated: true,
        isLoading: false,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    setState({
      accessToken: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });

    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
