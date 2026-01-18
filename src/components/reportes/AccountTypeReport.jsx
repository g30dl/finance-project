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

function AccountTypeReport() {
  const { casaData, personalData, comparativa, loading, error } =
    useAccountTypeData();
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
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('casa')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'casa'
              ? 'border-b-2 border-blue-400 text-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="h-4 w-4" />
          Dinero Casa
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'personal'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Cuentas Personales
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Recibido</p>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(currentData.totalRecibido)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-rose-500/30 bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-500/20 p-3">
              <TrendingDown className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Gastado</p>
              <p className="text-2xl font-bold text-rose-400">
                {formatCurrency(currentData.totalGastado)}
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`border-2 ${
            currentData.balance >= 0
              ? 'border-cyan-500/30 bg-cyan-950/20'
              : 'border-amber-500/30 bg-amber-950/20'
          }`}
        >
          <div>
            <p className="text-sm text-slate-400">Balance Neto</p>
            <p
              className={`text-2xl font-bold ${
                currentData.balance >= 0 ? 'text-cyan-400' : 'text-amber-400'
              }`}
            >
              {formatCurrency(currentData.balance)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {currentData.transacciones.ingresos} ingresos,{' '}
              {currentData.transacciones.egresos} egresos
            </p>
          </div>
        </Card>
      </div>

      <Card title="Tendencia Ultimos 6 Meses">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData.ultimosMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#34d399"
                strokeWidth={2}
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="egresos"
                stroke="#f87171"
                strokeWidth={2}
                name="Egresos"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#38bdf8"
                strokeWidth={2}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {activeTab === 'casa' ? (
        <CasaDistribution data={casaData} />
      ) : (
        <PersonalDistribution data={personalData} userMap={userMap} />
      )}

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
        <p className="text-sm text-slate-400">Sin categorias registradas.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="categoria" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="monto" fill="#60a5fa" name="Gasto Total" />
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
        <p className="text-sm text-slate-400">Sin movimientos personales.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={users}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="usuario" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="monto" fill="#34d399" name="Gasto Total" />
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
          <h4 className="mb-3 text-sm font-semibold text-slate-300">
            Distribucion de Ingresos
          </h4>
          <div className="space-y-3">
            <ProgressRow
              label="Dinero Casa"
              value={comparativa.porcentajes.casaRecibido}
              color="blue"
            />
            <ProgressRow
              label="Cuentas Personales"
              value={comparativa.porcentajes.personalRecibido}
              color="emerald"
            />
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-300">
            Distribucion de Gastos
          </h4>
          <div className="space-y-3">
            <ProgressRow
              label="Dinero Casa"
              value={comparativa.porcentajes.casaGastado}
              color="blue"
            />
            <ProgressRow
              label="Cuentas Personales"
              value={comparativa.porcentajes.personalGastado}
              color="emerald"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-700 pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <p className="text-sm text-slate-400">Total Recibido</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatCurrency(comparativa.totalRecibido)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400">Total Gastado</p>
            <p className="text-xl font-bold text-rose-400">
              {formatCurrency(comparativa.totalGastado)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400">Balance Sistema</p>
            <p
              className={`text-xl font-bold ${
                comparativa.balance >= 0 ? 'text-cyan-400' : 'text-amber-400'
              }`}
            >
              {formatCurrency(comparativa.balance)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProgressRow({ label, value, color }) {
  const colorClass = color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500';
  const textClass = color === 'emerald' ? 'text-emerald-400' : 'text-blue-400';

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className={textClass}>{label}</span>
        <span className="font-semibold text-slate-200">
          {Number(value || 0).toFixed(1)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default AccountTypeReport;
