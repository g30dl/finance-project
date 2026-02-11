import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushNotificationSupported,
} from '../services/webPush';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const redirectHandledRef = useRef(false);
  const swRegistrationCheckedRef = useRef(false);

  const initializePushNotifications = useCallback(async () => {
    if (!isPushNotificationSupported()) {
      console.log('Push notifications no soportadas en este navegador');
      return;
    }

    try {
      // 1. Registrar Service Worker
      const swResult = await registerServiceWorker();
      if (!swResult.success && !swResult.skipped) {
        console.warn('Error registrando Service Worker:', swResult.reason);
      }

      // 2. Solicitar permiso de notificaciones
      const permissionResult = await requestNotificationPermission();
      if (!permissionResult.success && !permissionResult.skipped) {
        console.warn('Error solicitando permiso:', permissionResult.reason);
        return;
      }

      // 3. Si el usuario permitió, suscribirse a push
      if (permissionResult.permission === 'granted') {
        const subscribeResult = await subscribeToPushNotifications();
        if (!subscribeResult.success && !subscribeResult.skipped) {
          console.warn('Error subscribiendo a push:', subscribeResult.reason);
        } else if (subscribeResult.success) {
          console.log('Push notifications inicializadas correctamente');
        }
      }
    } catch (error) {
      console.error('Error inicializando push notifications:', error);
    }
  }, []);

  const cleanupPushNotifications = useCallback(async () => {
    try {
      await unsubscribeFromPushNotifications();
    } catch (error) {
      console.warn('Error desuscribiendo de push:', error);
    }
  }, []);

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

    const redirectPromise = handleAdminRedirectResult()
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
      })
      .finally(() => {
        redirectHandledRef.current = true;
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      setLoading(true);

      if (!firebaseUser && !redirectHandledRef.current) {
        try {
          await redirectPromise;
        } catch (error) {
          // redirect errors already logged above
        }
        firebaseUser = auth.currentUser;
      }

      if (!firebaseUser) {
        try {
          await ensureAuthSession();
        } catch (error) {
          console.error('No se pudo iniciar sesion anonima:', error);
        }
        firebaseUser = auth.currentUser;
      }

      const resolvedUser = await resolveUser(firebaseUser);

      if (mounted) {
        setUser(resolvedUser);
        setLoading(false);
        setAuthReady(true);

        // Inicializar push notifications si hay un usuario autenticado
        if (resolvedUser && !swRegistrationCheckedRef.current) {
          swRegistrationCheckedRef.current = true;
          initializePushNotifications();
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [resolveUser, initializePushNotifications]);

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
    await cleanupPushNotifications();
    const result = await logoutService();
    setUser(null);
    setStatusMessage('');
    swRegistrationCheckedRef.current = false;
    return result;
  }, [cleanupPushNotifications]);

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
