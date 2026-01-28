import React, { useMemo } from 'react';
import TransactionItem from '../transactions/TransactionItem';
import { getMonthYear } from '../../utils/transactionHelpers';

const getTimestamp = (transaction) =>
  Number(
    transaction?.fecha ||
      transaction?.fechaSolicitud ||
      transaction?.fechaRespuesta ||
      0
  );

function TransactionList({ transactions = [], userId, loading, error }) {
  const grouped = useMemo(() => {
    const map = new Map();
    transactions.forEach((transaction) => {
      const timestamp = getTimestamp(transaction);
      const label = getMonthYear(timestamp);
      if (!map.has(label)) {
        map.set(label, { label, timestamp, items: [] });
      }
      map.get(label).items.push(transaction);
    });

    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-card">
        Cargando transacciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-red-500 shadow-card">
        {error}
      </div>
    );
  }

  if (!grouped.length) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-card">
        Sin movimientos en este periodo.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <details key={group.label} open className="rounded-2xl bg-white p-4 shadow-card">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-700">
            <span className="capitalize">{group.label}</span>
            <span className="text-xs text-gray-400">{group.items.length} mov.</span>
          </summary>
          <div className="mt-4 space-y-3">
            {group.items.map((transaction) => (
              <TransactionItem
                key={transaction.id || getTimestamp(transaction)}
                transaction={transaction}
                userId={userId}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default TransactionList;
