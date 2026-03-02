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
    <div style={styles.tooltip}>
      <p style={{ margin: 0, fontWeight: 600 }}>{formatDate(label)}</p>
      <p style={{ margin: 0, color: '#3b82f6' }}>{payload[0].value} kcal</p>
    </div>
  );
}

export default function CalorieChart({ data, targetCalories, title = 'Daily Calories' }) {
  if (!data || data.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No data yet. Start logging meals to see your calorie chart.</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          {targetCalories && (
            <ReferenceLine
              y={targetCalories}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: 'Target', fill: '#f59e0b', fontSize: 12 }}
            />
          )}
          <Bar dataKey="total_calories" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  targetCalories && entry.total_calories > targetCalories
                    ? '#fca5a5' // over target → red tint
                    : '#3b82f6'  // normal → blue
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
  wrapper: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 16px', fontSize: 16, fontWeight: 700 },
  empty: { background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af' },
  tooltip: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px 12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
};
