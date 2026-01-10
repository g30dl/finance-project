import { useEffect, useState } from 'react';

const DEFAULT_SUMMARY = {
  received: 0,
  spent: 0,
  balance: 0,
};

export const useMonthlyPersonalSummary = (userId) => {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setSummary(DEFAULT_SUMMARY);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timeout = setTimeout(() => {
      const received = 250;
      const spent = 130;
      setSummary({
        received,
        spent,
        balance: received - spent,
      });
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [userId]);

  return { summary, loading };
};
