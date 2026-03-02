const PROTEIN_SOURCES = 'chicken, eggs, paneer, Greek yogurt, lentils, tofu';
const FIBER_SOURCES   = 'oats, vegetables, fruits, legumes, whole grain bread';

function InsightCard({ label, current, target, sources, color, bg }) {
  if (!target) return null;
  const pct       = Math.min(Math.round((current / target) * 100), 100);
  const remaining = Math.max(0, target - current);
  const done      = pct >= 100;

  let message;
  if (done)          message = `You've hit your ${label.toLowerCase()} goal today! 🎉`;
  else if (pct >= 75) message = `Almost there — ${remaining}g more needed. Try: ${sources}`;
  else if (pct >= 40) message = `${remaining}g to go. Good sources: ${sources}`;
  else                message = `Low ${label.toLowerCase()} today. Boost with: ${sources}`;

  return (
    <div style={{ ...styles.card, background: bg, borderLeft: `3px solid ${color}` }}>
      <div style={styles.top}>
        <div style={styles.labelRow}>
          <span style={{ ...styles.dot, background: color }} />
          <span style={styles.name}>{label}</span>
          <span style={styles.pctText}>{pct}%</span>
        </div>
        <div style={styles.track}>
          <div style={{
            ...styles.fill,
            width: `${pct}%`,
            background: done ? color : color + 'CC',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
      <p style={styles.msg}>{message}</p>
    </div>
  );
}

export default function MacroInsight({ totals, targets }) {
  if (totals.protein_g <= 0 && totals.fiber_g <= 0) return null;

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Nutrition insights</h2>
      <div style={styles.cards}>
        <InsightCard
          label="Protein"
          current={totals.protein_g}
          target={targets.protein_g}
          sources={PROTEIN_SOURCES}
          color="#6366F1"
          bg="#F5F3FF"
        />
        <InsightCard
          label="Fiber"
          current={totals.fiber_g}
          target={targets.fiber_g}
          sources={FIBER_SOURCES}
          color="#22C55E"
          bg="#F0FDF4"
        />
      </div>
    </div>
  );
}

const styles = {
  section: { display: 'flex', flexDirection: 'column', gap: 12 },
  heading: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.2px' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  card: {
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    border: '1px solid transparent',
  },
  top: { display: 'flex', flexDirection: 'column', gap: 6 },
  labelRow: { display: 'flex', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  name: { fontSize: 13, fontWeight: 700, color: '#1A1A1A', flex: 1 },
  pctText: { fontSize: 13, fontWeight: 700, color: '#717171' },
  track: { height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
  msg: { margin: 0, fontSize: 12, color: '#4B5563', lineHeight: 1.6 },
};
