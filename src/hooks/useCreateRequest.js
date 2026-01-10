import { useState } from 'react';
import { createRequest } from '../services/requests';

export const useCreateRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitRequest = async (requestData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestId = await createRequest(requestData);
      setSuccess(true);
      return { success: true, requestId };
    } catch (err) {
      const message = err?.message || 'No se pudo crear la solicitud.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    submitRequest,
    loading,
    error,
    success,
    resetState,
  };
};
