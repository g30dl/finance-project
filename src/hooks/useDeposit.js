import { useState } from 'react';
import { executeDeposit } from '../services/deposits';

export const useDeposit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deposit = async (depositData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await executeDeposit(depositData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    deposit,
    loading,
    error,
    success,
    reset,
  };
};
