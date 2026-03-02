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
    <div style={tooltip}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 12, color: '#1A1A1A' }}>
        {formatDate(label)}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: 0, fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {p.value}g
        </p>
      ))}
    </div>
  );
}

const tooltip = {
  background: '#fff', border: '1px solid #EBEBEB', borderRadius: 12,
  padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
};

export default function MacroChart({ data, targets = {} }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={styles.wrapper} className="card-hover">
      <h3 style={styles.title}>7-day protein & fiber</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
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
            unit="g"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#717171', paddingTop: 8 }}
          />
          {targets.protein_g && (
            <ReferenceLine y={targets.protein_g} stroke="#6366F1" strokeDasharray="5 4"
              label={{ value: 'Protein target', fill: '#6366F1', fontSize: 10 }} />
          )}
          {targets.fiber_g && (
            <ReferenceLine y={targets.fiber_g} stroke="#22C55E" strokeDasharray="5 4"
              label={{ value: 'Fiber target', fill: '#22C55E', fontSize: 10 }} />
          )}
          <Line
            type="monotone" dataKey="total_protein_g" name="Protein"
            stroke="#6366F1" strokeWidth={2.5}
            dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone" dataKey="total_fiber_g" name="Fiber"
            stroke="#22C55E" strokeWidth={2.5}
            dot={{ r: 3, fill: '#22C55E', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
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
};
