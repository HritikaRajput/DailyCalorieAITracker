const PROTEIN_SOURCES = 'chicken, eggs, paneer, Greek yogurt, lentils, tofu';
const FIBER_SOURCES = 'oats, vegetables, fruits, legumes, whole grain bread';

function InsightLine({ label, current, target, sources, color }) {
  if (!target) return null;
  const remaining = Math.max(0, target - current);
  const pct = Math.min(Math.round((current / target) * 100), 100);

  let message;
  if (pct >= 100)       message = `${label} goal achieved! 🎉`;
  else if (pct >= 75)   message = `Almost there — ${remaining}g more ${label.toLowerCase()} needed. Try: ${sources}`;
  else if (pct >= 40)   message = `${remaining}g more ${label.toLowerCase()} to go. Good sources: ${sources}`;
  else                  message = `Low ${label.toLowerCase()} today (${current}g / ${target}g). Boost with: ${sources}`;

  return (
    <div style={styles.line}>
      <span style={{ ...styles.dot, background: color }} />
      <span style={styles.text}>{message}</span>
    </div>
  );
}

export default function MacroInsight({ totals, targets }) {
  const hasData = totals.protein_g > 0 || totals.fiber_g > 0;
  if (!hasData) return null;

  return (
    <div style={styles.card}>
      <p style={styles.heading}>Nutrition Insights</p>
      <InsightLine
        label="Protein"
        current={totals.protein_g}
        target={targets.protein_g}
        sources={PROTEIN_SOURCES}
        color="#6366f1"
      />
      <InsightLine
        label="Fiber"
        current={totals.fiber_g}
        target={targets.fiber_g}
        sources={FIBER_SOURCES}
        color="#10b981"
      />
    </div>
  );
}

const styles = {
  card: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  heading: { margin: 0, fontWeight: 700, fontSize: 15 },
  line: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  text: { fontSize: 13, color: '#374151', lineHeight: 1.5 },
};
