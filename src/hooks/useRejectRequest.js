import { useState } from 'react';
import { rejectRequest } from '../services/requests';

export const useRejectRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reject = async (requestId, adminId, reason) => {
    setLoading(true);
    setError(null);

    try {
      await rejectRequest(requestId, adminId, reason);
      return { success: true };
    } catch (err) {
      const message = err?.message || 'No se pudo rechazar la solicitud.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { reject, loading, error };
};
