import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={styles.tooltip}>
      <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{formatDate(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: 0, color: p.color }}>
          {p.name}: {p.value}g
        </p>
      ))}
    </div>
  );
}

export default function MacroChart({ data, targets = {} }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>7-Day Protein & Fiber</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="g" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {targets.protein_g && (
            <ReferenceLine y={targets.protein_g} stroke="#6366f1" strokeDasharray="4 4"
              label={{ value: `Protein target`, fill: '#6366f1', fontSize: 10 }} />
          )}
          {targets.fiber_g && (
            <ReferenceLine y={targets.fiber_g} stroke="#10b981" strokeDasharray="4 4"
              label={{ value: `Fiber target`, fill: '#10b981', fontSize: 10 }} />
          )}
          <Line type="monotone" dataKey="total_protein_g" name="Protein" stroke="#6366f1"
            strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="total_fiber_g" name="Fiber" stroke="#10b981"
            strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  wrapper: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 16px', fontSize: 16, fontWeight: 700 },
  tooltip: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
};
