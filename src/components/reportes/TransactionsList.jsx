import React, { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { Card, EmptyState } from '../common';
import TransactionItem from '../personal/TransactionItem';

const getTimestamp = (transaction) =>
  Number(
    transaction?.fecha ||
      transaction?.fechaSolicitud ||
      transaction?.fechaRespuesta ||
      0
  );

function TransactionsList({ transactions = [], userId, limit = 10 }) {
  const items = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => getTimestamp(b) - getTimestamp(a)
    );
    return sorted.slice(0, limit);
  }, [transactions, limit]);

  const subtitle = transactions.length
    ? `Mostrando ${items.length} de ${transactions.length}`
    : 'Sin movimientos';

  return (
    <Card title="Ultimas Transacciones" subtitle={subtitle}>
      {items.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="Sin movimientos"
          description="No hay transacciones para este periodo."
        />
      ) : (
        <div className="space-y-3">
          {items.map((transaction) => (
            <TransactionItem
              key={transaction.id || getTimestamp(transaction)}
              transaction={transaction}
              userId={userId}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default TransactionsList;
