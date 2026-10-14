import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from './api';

const AuthContext = createContext(null);

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  // Listen for global auth:expired events triggered by api.js
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout]);

  // Periodic token validity check every 30 seconds
  useEffect(() => {
    const checkTokenValidity = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && isTokenExpired(currentToken)) {
        logout();
        if (
          typeof window !== 'undefined' &&
          !['/login', '/signup', '/forget-password', '/update-password'].includes(
            window.location.pathname
          )
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    };

    const interval = setInterval(checkTokenValidity, 30000);
    return () => clearInterval(interval);
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        if (isTokenExpired(savedToken)) {
          logout();
          setLoading(false);
          return;
        }

        try {
          const res = await authApi.me();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    if (authToken) {
      localStorage.setItem('token', authToken);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem('user', JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  };

  const isAuthenticated = Boolean(user && token && !isTokenExpired(token));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
