import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltip}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>
        {formatDate(label)}
      </p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#22C55E' }}>
        {payload[0].value.toLocaleString()} kcal
      </p>
    </div>
  );
}

const tooltip = {
  background: '#fff', border: '1px solid #EBEBEB', borderRadius: 12,
  padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
};

export default function CalorieChart({ data, targetCalories, title = 'Daily Calories' }) {
  if (!data || data.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>No data yet — start logging meals to see your chart.</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper} className="card-hover">
      <h3 style={styles.title}>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#B0B0B0' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#B0B0B0' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          {targetCalories && (
            <ReferenceLine
              y={targetCalories}
              stroke="#F59E0B"
              strokeDasharray="6 4"
              label={{ value: 'Target', fill: '#F59E0B', fontSize: 11, fontWeight: 600 }}
            />
          )}
          <Bar dataKey="total_calories" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  targetCalories && entry.total_calories > targetCalories
                    ? '#FCA5A5'
                    : '#22C55E'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  wrapper: {
    background: '#fff', borderRadius: 16, padding: '20px 20px 12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EBEBEB',
  },
  title: { margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#1A1A1A' },
  empty: {
    background: '#fff', borderRadius: 16, padding: 48,
    textAlign: 'center', border: '1px solid #EBEBEB',
  },
  emptyText: { margin: 0, color: '#B0B0B0', fontSize: 14 },
};
