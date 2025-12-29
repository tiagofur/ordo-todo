'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  subscriptionTier?: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ordotodo.app';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('ordo_token');
    if (token) {
      // Validate token and get user info
      fetchUserInfo(token);
    } else {
      setIsLoading(false);
    }

    // Listen for auth messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== APP_URL) return;
      if (event.data?.type === 'AUTH_SUCCESS' && event.data?.token) {
        localStorage.setItem('ordo_token', event.data.token);
        if (event.data.user) {
          setUser(event.data.user);
        } else {
          fetchUserInfo(event.data.token);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch(`${APP_URL}/api/v1/users/me/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.username,
          image: userData.image,
          subscriptionTier: userData.subscription?.tier || 'FREE',
        });
      } else {
        // Token invalid, remove it
        localStorage.removeItem('ordo_token');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Open login popup to main app
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    window.open(
      `${APP_URL}/login?redirect=marketing`,
      'ordo-login',
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );
  };

  const logout = () => {
    localStorage.removeItem('ordo_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
