import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  ensureAuthSession,
  getUserFromDatabase,
  loginAsAdmin,
  loginAsUser,
  logout as logoutService,
  handleAdminRedirectResult,
} from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const resolveUser = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return null;
    try {
      return await getUserFromDatabase(firebaseUser);
    } catch (error) {
      console.error('Error resolviendo usuario desde database:', error);
      return null;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    const resolvedUser = await resolveUser(auth.currentUser);
    setUser(resolvedUser);
    setLoading(false);
    return resolvedUser;
  }, [resolveUser]);

  useEffect(() => {
    let mounted = true;

    handleAdminRedirectResult()
      .then((result) => {
        if (!mounted) return;
        if (result?.success && result.user) {
          setUser(result.user);
        } else if (result?.error) {
          console.warn('Login redirect admin:', result.error);
        }
      })
      .catch((error) => {
        console.warn('Login redirect admin:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      setLoading(true);
      const resolvedUser = await resolveUser(firebaseUser);

      if (mounted) {
        setUser(resolvedUser);
        setLoading(false);
        setAuthReady(true);
      }
    });

    // Garantiza que exista una sesion de Firebase para leer datos publicos/autenticados.
    ensureAuthSession().catch((error) => {
      console.error('No se pudo iniciar sesion anonima:', error);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [resolveUser]);

  const login = useCallback(async (credentials) => {
    setStatusMessage('');
    const type = credentials?.type;

    try {
      const result =
        type === 'admin'
          ? await loginAsAdmin(credentials)
          : await loginAsUser(credentials?.userId, credentials?.userName);

      if (result?.success) {
        setUser(result.user);
      } else if (result?.error) {
        setStatusMessage(result.error);
      }

      return result;
    } catch (error) {
      console.error('Error al iniciar sesion:', error);
      const message = 'No se pudo iniciar sesion.';
      setStatusMessage(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    const result = await logoutService();
    setUser(null);
    setStatusMessage('');
    return result;
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

  if (!authReady) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
