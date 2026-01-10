import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentUser,
  loginAsAdmin,
  loginAsUser,
  logout as logoutService,
} from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const checkAuth = useCallback(() => {
    setLoading(true);
    let expired = false;

    if (typeof localStorage !== 'undefined') {
      const expiry = Number(localStorage.getItem('sessionExpiry') || 0);
      if (expiry && expiry < Date.now()) {
        expired = true;
      }
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser && expired) {
      setStatusMessage('Sesion expirada. Por favor inicia sesion nuevamente.');
    }

    setLoading(false);
    return currentUser;
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials) => {
    setStatusMessage('');
    const type = credentials?.type;

    try {
      const result =
        type === 'admin'
          ? await loginAsAdmin(credentials?.pin)
          : loginAsUser(credentials?.userId, credentials?.userName);

      if (result?.success) {
        setUser(result.user);
      }

      return result;
    } catch (error) {
      console.error('Error al iniciar sesion:', error);
      return { success: false, error: 'No se pudo iniciar sesion.' };
    }
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    setStatusMessage('');
    return { success: true };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      checkAuth,
      statusMessage,
    }),
    [user, loading, login, logout, checkAuth, statusMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
