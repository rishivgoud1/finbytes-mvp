'use client';

import { useContext, createContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, clearAuthToken } from './api';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authAPI.profile();
      if (response.success && response.data) {
        setUser(response.data as User);
      } else {
        clearAuthToken();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    const response = await authAPI.login(email, password);
    if (!response.success) {
      setError(response.error || 'Login failed');
      return;
    }
    setAuthToken(response.data!.token);
    setUser(response.data!.user);
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}