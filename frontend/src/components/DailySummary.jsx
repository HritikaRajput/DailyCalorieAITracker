function CalorieRing({ calories, target }) {
  const size   = 148;
  const stroke = 12;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const pct    = target ? Math.min(calories / target, 1) : 0;
  const over   = target && calories > target;
  const color  = over ? '#DC2626' : '#22C55E';
  const dash   = pct * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.3s' }}
          />
        )}
      </svg>
      <div style={ringLabel}>
        <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: over ? '#DC2626' : '#1A1A1A' }}>
          {calories.toLocaleString()}
        </span>
        <span style={{ fontSize: 11, color: '#717171', fontWeight: 500, marginTop: 2 }}>kcal eaten</span>
      </div>
    </div>
  );
}

const ringLabel = {
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
};

function MacroPill({ label, value, target, color }) {
  const pct  = target ? Math.min(Math.round((value / target) * 100), 100) : null;
  const over = target && value > target;
  return (
    <div style={pill.wrap}>
      <div style={pill.top}>
        <span style={{ ...pill.dot, background: color }} />
        <span style={pill.name}>{label}</span>
        <span style={{ ...pill.val, color: over ? '#DC2626' : '#1A1A1A' }}>
          {value}g{target ? `/${target}g` : ''}
        </span>
      </div>
      <div style={pill.track}>
        <div style={{ ...pill.fill, width: `${pct ?? 0}%`, background: over ? '#DC2626' : color, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

const pill = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 90 },
  top:  { display: 'flex', alignItems: 'center', gap: 5 },
  dot:  { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  name: { fontSize: 11, fontWeight: 600, color: '#717171', flex: 1 },
  val:  { fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },
  track:{ height: 4, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
};

export default function DailySummary({ totalCalories, targetCalories, date, totals = {}, targets = {} }) {
  const over  = targetCalories && totalCalories > targetCalories;
  const today = new Date().toISOString().split('T')[0];
  const label = date === today ? "Today's intake" : date;
  const hasMacros = totals.protein_g > 0 || totals.fiber_g > 0 || totals.carbs_g > 0 || totals.fat_g > 0;

  return (
    <div style={styles.card} className="card-hover">
      <div style={styles.inner}>
        <CalorieRing calories={totalCalories} target={targetCalories} />

        <div style={styles.right}>
          <p style={styles.dateLabel}>{label}</p>

          {targetCalories && (
            <div style={styles.targetRow}>
              <span style={styles.targetLabel}>Daily target</span>
              <span style={styles.targetVal}>{targetCalories.toLocaleString()} kcal</span>
            </div>
          )}

          {targetCalories && (
            <div style={styles.remainRow}>
              {over ? (
                <span style={styles.overBadge}>
                  +{(totalCalories - targetCalories).toLocaleString()} kcal over
                </span>
              ) : (
                <span style={styles.underBadge}>
                  {(targetCalories - totalCalories).toLocaleString()} kcal remaining
                </span>
              )}
            </div>
          )}

          {hasMacros && (
            <div style={styles.macros}>
              <MacroPill label="Protein" value={totals.protein_g || 0} target={targets.protein_g} color="#6366F1" />
              <MacroPill label="Fiber"   value={totals.fiber_g   || 0} target={targets.fiber_g}   color="#22C55E" />
              <MacroPill label="Carbs"   value={totals.carbs_g   || 0} target={null}               color="#F59E0B" />
              <MacroPill label="Fat"     value={totals.fat_g     || 0} target={null}               color="#F97316" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '24px 28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #EBEBEB',
  },
  inner: { display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' },
  right: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 },
  dateLabel: { margin: 0, fontSize: 13, color: '#717171', fontWeight: 500 },
  targetRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  targetLabel: { fontSize: 13, color: '#717171' },
  targetVal: { fontSize: 14, fontWeight: 700, color: '#1A1A1A' },
  remainRow: { display: 'flex' },
  overBadge: {
    fontSize: 12, fontWeight: 600, color: '#DC2626',
    background: '#FFF5F5', border: '1px solid #FECACA',
    padding: '4px 10px', borderRadius: 20,
  },
  underBadge: {
    fontSize: 12, fontWeight: 600, color: '#15803D',
    background: '#F0FDF4', border: '1px solid #BBF7D0',
    padding: '4px 10px', borderRadius: 20,
  },
  macros: { display: 'flex', gap: 10, flexWrap: 'wrap' },
};
