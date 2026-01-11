import { useState } from 'react';
import { createPersonalExpense } from '../services/personalExpenses';

export const useCreatePersonalExpense = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitExpense = async (expenseData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createPersonalExpense(expenseData);
      setSuccess(true);
      return { success: true, ...result };
    } catch (err) {
      const message = err?.message || 'No se pudo registrar el gasto.';
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
    submitExpense,
    loading,
    error,
    success,
    resetState,
  };
};
