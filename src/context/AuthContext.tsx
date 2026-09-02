import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, setStoredUser, clearStoredUser, getToken } from '../service/auth.service';
import type { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  login: (user: Usuario) => void;
  logout: () => void;
  updateUser: (user: Usuario) => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(getStoredUser());

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        setUser(getStoredUser());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData: Usuario) => {
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = () => {
    clearStoredUser();
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUser = (userData: Usuario) => {
    setStoredUser(userData);
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ROLE_ADMIN',
    isCitizen: user?.role === 'ROLE_USER',
    login,
    logout,
    updateUser,
    token: getToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};