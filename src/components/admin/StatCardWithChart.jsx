import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

const COLOR_STYLES = {
  primary: {
    chip: 'bg-primary/10 text-primary',
    icon: 'bg-primary/10 text-primary',
    line: '#2563EB',
  },
  success: {
    chip: 'bg-success/10 text-success',
    icon: 'bg-success/10 text-success',
    line: '#16A34A',
  },
  warning: {
    chip: 'bg-warning/10 text-warning',
    icon: 'bg-warning/10 text-warning',
    line: '#F59E0B',
  },
  danger: {
    chip: 'bg-danger/10 text-danger',
    icon: 'bg-danger/10 text-danger',
    line: '#EF4444',
  },
  info: {
    chip: 'bg-info/10 text-info',
    icon: 'bg-info/10 text-info',
    line: '#0EA5E9',
  },
};

function StatCardWithChart({ label, value, trend, icon: Icon, color = 'primary', data = [] }) {
  const styles = COLOR_STYLES[color] || COLOR_STYLES.primary;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-3 ${styles.icon}`}>
          {Icon ? <Icon className="h-6 w-6" /> : null}
        </div>
        {trend ? (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles.chip}`}>
            {trend}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 font-heading text-3xl font-bold text-foreground">{value}</h3>
      <p className="text-sm text-foreground-muted">{label}</p>

      <div className="mt-3 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke={styles.line} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default StatCardWithChart;
