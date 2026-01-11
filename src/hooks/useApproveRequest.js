import { useState } from 'react';
import { approveRequest } from '../services/requests';

export const useApproveRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const approve = async (requestId, adminId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await approveRequest(requestId, adminId);
      return { success: true, ...result };
    } catch (err) {
      const message = err?.message || 'No se pudo aprobar la solicitud.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { approve, loading, error };
};
