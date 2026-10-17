import React, { createContext, useContext, useState, useEffect } from 'react';
import { type UserProfile, getAuthToken, setAuthToken, clearAuthToken, apiRequest } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('talentpilot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const profile = await apiRequest<UserProfile>('/auth/me');
          setUser(profile);
          localStorage.setItem('talentpilot_user', JSON.stringify(profile));
        } catch {
          clearAuthToken();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ access_token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('talentpilot_user', JSON.stringify(res.user));
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
