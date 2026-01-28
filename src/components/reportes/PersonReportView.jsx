import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { usePersonReport } from '../../hooks/usePersonReport';
import { useUsers } from '../../hooks/useUsers';
import { Alert, Card, Select, Skeleton } from '../common';
import { generateCSV } from '../../utils/csvExport';
import PersonalStatsCard from './PersonalStatsCard';
import RequestStatsCard from './RequestStatsCard';
import ComparisonChart from './ComparisonChart';
import TransactionsList from './TransactionsList';
import ExportButtons from './ExportButtons';
import ReportPreview from './ReportPreview';

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

  const csvContent = useMemo(() => {
    if (!selectedUser) return '';
    return generateCSV(transactions, requests);
  }, [selectedUser, transactions, requests]);

  const exportFilename = useMemo(
    () => (selectedUser ? `reporte_${selectedUser}_${period}` : 'reporte'),
    [selectedUser, period]
  );

  const previewItems = useMemo(
    () => [
      { label: 'Ingresos', value: personalStats?.ingresos || 0 },
      { label: 'Egresos', value: personalStats?.egresos || 0 },
      { label: 'Solicitudes', value: requestStats?.total || 0 },
      { label: 'Aprobadas', value: requestStats?.aprobadas || 0 },
    ],
    [personalStats, requestStats]
  );

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
            <ExportButtons
              csvContent={csvContent}
              filenameBase={exportFilename}
              disabled={!selectedUser || loading}
            />
          </div>
        </div>
      </Card>

      {usersError ? (
        <Alert variant="danger">Error al cargar usuarios.</Alert>
      ) : null}

      {!selectedUser ? (
        <Card>
          <div className="py-12 text-center text-foreground-muted">
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
          <ReportPreview
            title="Resumen del reporte"
            subtitle="Vista previa antes de exportar"
            items={previewItems}
          />
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
