import React, { useMemo, useState } from 'react';
import { Download, Users } from 'lucide-react';
import { usePersonReport } from '../../hooks/usePersonReport';
import { useUsers } from '../../hooks/useUsers';
import { Alert, Button, Card, Select, Skeleton } from '../common';
import { downloadCSV, generateCSV } from '../../utils/csvExport';
import PersonalStatsCard from './PersonalStatsCard';
import RequestStatsCard from './RequestStatsCard';
import ComparisonChart from './ComparisonChart';
import TransactionsList from './TransactionsList';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Ultima semana' },
  { value: 'month', label: 'Ultimo mes' },
  { value: '3months', label: 'Ultimos 3 meses' },
  { value: 'year', label: 'Ultimo ano' },
  { value: 'all', label: 'Todo el tiempo' },
];

function PersonReportView() {
  const [selectedUser, setSelectedUser] = useState('');
  const [period, setPeriod] = useState('month');
  const { users, loading: loadingUsers, error: usersError } = useUsers();
  const {
    personalStats,
    requestStats,
    transactions,
    requests,
    loading,
    error,
  } = usePersonReport(selectedUser, period);

  const userOptions = useMemo(() => {
    return users
      .filter((user) => user.rol === 'solicitante')
      .map((user) => ({
        value: user.userId,
        label: user.nombre,
      }));
  }, [users]);

  const handleExportCSV = () => {
    if (!selectedUser) return;
    const content = generateCSV(transactions, requests);
    downloadCSV(content, `reporte_${selectedUser}_${period}.csv`);
  };

  const showReport = selectedUser && !loading && !error;

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Usuario"
            options={userOptions}
            value={selectedUser}
            onChange={(event) => setSelectedUser(event.target.value)}
            placeholder="Selecciona un usuario..."
            disabled={loadingUsers}
          />
          <Select
            label="Periodo"
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            placeholder="Selecciona un periodo..."
            disabled={!selectedUser}
          />
          <div className="flex items-end">
            <Button
              onClick={handleExportCSV}
              disabled={!selectedUser || loading}
              icon={<Download className="h-4 w-4" />}
              fullWidth
            >
              Exportar CSV
            </Button>
          </div>
        </div>
      </Card>

      {usersError ? (
        <Alert variant="danger">Error al cargar usuarios.</Alert>
      ) : null}

      {!selectedUser ? (
        <Card>
          <div className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
            <p>Selecciona un usuario para ver su reporte.</p>
          </div>
        </Card>
      ) : null}

      {selectedUser && loading ? (
        <div className="space-y-4">
          <Skeleton height="h-32" />
          <Skeleton height="h-32" />
          <Skeleton height="h-64" />
        </div>
      ) : null}

      {selectedUser && error ? <Alert variant="danger">{error}</Alert> : null}

      {showReport ? (
        <>
          <PersonalStatsCard stats={personalStats} />
          <RequestStatsCard stats={requestStats} />
          <ComparisonChart personalStats={personalStats} requestStats={requestStats} />
          <TransactionsList transactions={transactions} userId={selectedUser} />
        </>
      ) : null}
    </div>
  );
}

export default PersonReportView;
