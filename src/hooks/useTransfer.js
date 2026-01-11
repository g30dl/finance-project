import { useState } from 'react';
import { executeTransfer } from '../services/transfers';

export const useTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const transfer = async (transferData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await executeTransfer(transferData);

      if (result.success) {
        setSuccess(true);
        return { success: true, ...result };
      }

      setError(result.error);
      return { success: false, error: result.error };
    } catch (err) {
      const message = err?.message || 'Error al realizar transferencia';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    transfer,
    loading,
    error,
    success,
    reset,
  };
};
