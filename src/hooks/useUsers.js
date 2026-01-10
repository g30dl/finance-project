import { useCallback, useMemo } from 'react';
import { useFirebaseData } from './useFirebaseData';

const USERS_PATH = 'familia_finanzas/usuarios';

export const useUsers = () => {
  const { data, loading, error } = useFirebaseData(USERS_PATH);

  const users = useMemo(() => {
    if (!data) return [];
    return Object.entries(data)
      .map(([userId, user]) => ({ userId, ...user }))
      .filter((user) => user.activo !== false)
      .sort((a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', {
          sensitivity: 'base',
        })
      );
  }, [data]);

  const getUsersByRole = useCallback(
    (role) => users.filter((user) => user.rol === role),
    [users]
  );

  return { users, loading, error, getUsersByRole };
};
