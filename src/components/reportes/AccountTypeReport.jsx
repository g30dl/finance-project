import React, { useMemo, useState } from 'react';
import { Home, TrendingDown, TrendingUp, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAccountTypeData } from '../../hooks/useAccountTypeData';
import { useUsers } from '../../hooks/useUsers';
import { Alert, Card, Skeleton } from '../common';
import { formatCurrency } from '../../utils/helpers';

const formatTooltip = (value) => formatCurrency(value);

const CHART_THEME = {
  grid: 'hsl(var(--border))',
  axis: 'hsl(var(--muted-foreground))',
  tooltip: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    color: 'hsl(var(--foreground))',
  },
};

const CHART_COLORS = {
  ingresos: 'hsl(var(--sage))',
  egresos: 'hsl(var(--terracotta))',
  balance: 'hsl(var(--primary))',
  casa: 'hsl(var(--navy))',
  personal: 'hsl(var(--sage))',
};

function AccountTypeReport() {
  const { casaData, personalData, comparativa, loading, error } = useAccountTypeData();
  const { users } = useUsers();
  const [activeTab, setActiveTab] = useState('casa');

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      map.set(user.userId, user.nombre || user.userId);
    });
    return map;
  }, [users]);

  const currentData = activeTab === 'casa' ? casaData : personalData;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-40" />
        <Skeleton height="h-64" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error al cargar reportes: {error}</Alert>;
  }

  if (!currentData) {
    return <Alert variant="danger">No hay datos disponibles.</Alert>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('casa')}
          className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'casa'
              ? 'border-navy/40 bg-navy/10 text-navy'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="h-4 w-4" />
          Dinero Casa
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'personal'
              ? 'border-sage/40 bg-sage/10 text-sage'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Cuentas Personales
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-success/35 bg-success/10">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-success/30 bg-success/10 p-3 text-success">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Recibido</p>
              <p className="font-heading text-2xl text-success">{formatCurrency(currentData.totalRecibido)}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-destructive/35 bg-destructive/10">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-destructive">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gastado</p>
              <p className="font-heading text-2xl text-destructive">{formatCurrency(currentData.totalGastado)}</p>
            </div>
          </div>
        </Card>

        <Card
          className={`border ${
            currentData.balance >= 0
              ? 'border-primary/35 bg-primary/10'
              : 'border-warning/35 bg-warning/10'
          }`}
        >
          <div>
            <p className="text-sm text-muted-foreground">Balance Neto</p>
            <p className={`font-heading text-2xl ${currentData.balance >= 0 ? 'text-primary' : 'text-warning'}`}>
              {formatCurrency(currentData.balance)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentData.transacciones.ingresos} ingresos, {currentData.transacciones.egresos} egresos
            </p>
          </div>
        </Card>
      </div>

      <Card title="Tendencia Ultimos 6 Meses">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData.ultimosMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="mes" stroke={CHART_THEME.axis} />
              <YAxis stroke={CHART_THEME.axis} />
              <Tooltip formatter={formatTooltip} contentStyle={CHART_THEME.tooltip} />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke={CHART_COLORS.ingresos} strokeWidth={2} name="Ingresos" />
              <Line type="monotone" dataKey="egresos" stroke={CHART_COLORS.egresos} strokeWidth={2} name="Egresos" />
              <Line type="monotone" dataKey="balance" stroke={CHART_COLORS.balance} strokeWidth={2} name="Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {activeTab === 'casa' ? <CasaDistribution data={casaData} /> : <PersonalDistribution data={personalData} userMap={userMap} />}

      <GlobalComparison comparativa={comparativa} />
    </div>
  );
}

function CasaDistribution({ data }) {
  const categories = useMemo(() => {
    if (!data?.porCategoria) return [];
    return Object.entries(data.porCategoria)
      .map(([category, amount]) => ({
        categoria: String(category),
        monto: Number(amount) || 0,
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5);
  }, [data]);

  return (
    <Card title="Top 5 Categorias Mas Gastadas">
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin categorias registradas.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="categoria" stroke={CHART_THEME.axis} />
              <YAxis stroke={CHART_THEME.axis} />
              <Tooltip formatter={formatTooltip} contentStyle={CHART_THEME.tooltip} />
              <Bar dataKey="monto" fill={CHART_COLORS.casa} name="Gasto Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function PersonalDistribution({ data, userMap }) {
  const users = useMemo(() => {
    if (!data?.porUsuario) return [];
    return Object.entries(data.porUsuario)
      .map(([userId, amount]) => ({
        usuario: userMap.get(userId) || userId,
        monto: Number(amount) || 0,
      }))
      .sort((a, b) => b.monto - a.monto);
  }, [data, userMap]);

  return (
    <Card title="Distribucion del Gasto por Usuario">
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin movimientos personales.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={users}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="usuario" stroke={CHART_THEME.axis} />
              <YAxis stroke={CHART_THEME.axis} />
              <Tooltip formatter={formatTooltip} contentStyle={CHART_THEME.tooltip} />
              <Bar dataKey="monto" fill={CHART_COLORS.personal} name="Gasto Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function GlobalComparison({ comparativa }) {
  if (!comparativa) return null;

  return (
    <Card title="Comparativa Global del Sistema">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-heading text-sm text-foreground">Distribucion de Ingresos</h4>
          <div className="space-y-3">
            <ProgressRow label="Dinero Casa" value={comparativa.porcentajes.casaRecibido} color="casa" />
            <ProgressRow
              label="Cuentas Personales"
              value={comparativa.porcentajes.personalRecibido}
              color="personal"
            />
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-heading text-sm text-foreground">Distribucion de Gastos</h4>
          <div className="space-y-3">
            <ProgressRow label="Dinero Casa" value={comparativa.porcentajes.casaGastado} color="casa" />
            <ProgressRow
              label="Cuentas Personales"
              value={comparativa.porcentajes.personalGastado}
              color="personal"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border/80 pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Recibido</p>
            <p className="font-heading text-xl text-success">{formatCurrency(comparativa.totalRecibido)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Gastado</p>
            <p className="font-heading text-xl text-destructive">{formatCurrency(comparativa.totalGastado)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Balance Sistema</p>
            <p className={`font-heading text-xl ${comparativa.balance >= 0 ? 'text-primary' : 'text-warning'}`}>
              {formatCurrency(comparativa.balance)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProgressRow({ label, value, color }) {
  const isPersonal = color === 'personal';
  const colorClass = isPersonal ? 'bg-sage' : 'bg-navy';
  const textClass = isPersonal ? 'text-sage' : 'text-navy';

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className={textClass}>{label}</span>
        <span className="font-semibold text-foreground">{Number(value || 0).toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-secondary">
        <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default AccountTypeReport;

