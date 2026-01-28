import React, { useState } from 'react';
import { useBalance } from '../../hooks/useBalance';
import BalanceCheck from '../../components/requests/BalanceCheck';
import RequestForm from '../../components/solicitudes/RequestForm';
import AnimatedSection from '../../components/common/AnimatedSection';

function RequestTab() {
  const { balance: casaBalance, loading } = useBalance('casa');
  const [amount, setAmount] = useState(0);
  const projectedBalance = Number(casaBalance || 0) - Number(amount || 0);

  return (
    <div className="pb-24 px-4 pt-4 space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-foreground">Solicitar dinero</h2>
        <p className="text-sm text-foreground-muted">Completa el formulario y envia tu solicitud.</p>
      </div>

      <AnimatedSection>
        <BalanceCheck
          balance={casaBalance}
          projectedBalance={projectedBalance}
          loading={loading}
        />
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <div className="rounded-3xl bg-white p-5 shadow-card">
          <RequestForm onAmountChange={setAmount} />
        </div>
      </AnimatedSection>
    </div>
  );
}

export default RequestTab;
