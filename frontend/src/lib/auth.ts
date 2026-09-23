import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  employee_id: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  hydrate: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,
  login: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ user, isAuthenticated: true, hydrated: true });
  },
  hydrate: (user) => set({ user, isAuthenticated: true, hydrated: true }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ user: null, isAuthenticated: false, hydrated: true });
  },
}));
