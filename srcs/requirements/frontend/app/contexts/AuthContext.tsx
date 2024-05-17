import { User } from '@/components/userPreview';
import React, { createContext, useState } from 'react';
import { ReactNode } from 'react';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean | null;
  validate: (userData: User) => void;
  invalidate: () => void;
};

const AuthContext = createContext<AuthContextValue>({ user: null, isAuthenticated: null, validate: (userData: User) => {}, invalidate: () => {} });

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const validate = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  }

  const invalidate = () => {
    setIsAuthenticated(false);
    setUser(null);
  }

  const contextValue: AuthContextValue = {
    user,
    isAuthenticated,
    validate,
    invalidate,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
