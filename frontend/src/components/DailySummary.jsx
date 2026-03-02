function MacroBar({ label, value, target, color }) {
  const pct = target ? Math.min((value / target) * 100, 100) : null;
  const over = target && value > target;
  return (
    <div style={styles.macroRow}>
      <div style={styles.macroLabel}>
        <span style={styles.macroName}>{label}</span>
        <span style={styles.macroVal}>
          {value}g{target ? ` / ${target}g` : ''}
        </span>
      </div>
      {pct !== null && (
        <div style={styles.barBg}>
          <div style={{ ...styles.barFill, width: `${pct}%`, background: over ? '#ef4444' : color }} />
        </div>
      )}
    </div>
  );
}

export default function DailySummary({ totalCalories, targetCalories, date, totals = {}, targets = {} }) {
  const pct = targetCalories ? Math.min((totalCalories / targetCalories) * 100, 100) : null;
  const over = targetCalories && totalCalories > targetCalories;
  const today = new Date().toISOString().split('T')[0];
  const label = date === today ? 'Today' : date;

  return (
    <div style={styles.wrapper}>
      {/* ── Calorie row ── */}
      <div style={styles.row}>
        <div>
          <p style={styles.label}>{label}'s Calories</p>
          <p style={{ ...styles.total, color: over ? '#ef4444' : '#111827' }}>
            {totalCalories.toLocaleString()} kcal
          </p>
        </div>
        {targetCalories && (
          <div style={styles.targetBox}>
            <p style={styles.label}>Target</p>
            <p style={styles.target}>{targetCalories.toLocaleString()} kcal</p>
          </div>
        )}
      </div>

      {pct !== null && (
        <div style={{ ...styles.barBg, marginTop: 12 }}>
          <div style={{ ...styles.barFill, width: `${pct}%`, background: over ? '#ef4444' : '#3b82f6' }} />
        </div>
      )}
      {over && (
        <p style={styles.warning}>
          ⚠️ {(totalCalories - targetCalories).toLocaleString()} kcal over target today
        </p>
      )}

      {/* ── Macro bars ── */}
      {(totals.protein_g > 0 || totals.fiber_g > 0 || totals.carbs_g > 0 || totals.fat_g > 0) && (
        <div style={styles.macros}>
          <MacroBar label="Protein" value={totals.protein_g || 0} target={targets.protein_g} color="#6366f1" />
          <MacroBar label="Fiber"   value={totals.fiber_g   || 0} target={targets.fiber_g}   color="#10b981" />
          <MacroBar label="Carbs"   value={totals.carbs_g   || 0} target={null}               color="#f59e0b" />
          <MacroBar label="Fat"     value={totals.fat_g     || 0} target={null}               color="#f97316" />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 12, padding: 20 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { margin: 0, fontSize: 13, color: '#6b7280' },
  total: { margin: '4px 0 0', fontSize: 32, fontWeight: 800 },
  targetBox: { textAlign: 'right' },
  target: { margin: '4px 0 0', fontSize: 18, fontWeight: 600, color: '#374151' },
  barBg: { background: '#bfdbfe', borderRadius: 99, height: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.4s ease' },
  warning: { margin: '8px 0 0', fontSize: 13, color: '#ef4444' },
  macros: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  macroRow: { display: 'flex', flexDirection: 'column', gap: 4 },
  macroLabel: { display: 'flex', justifyContent: 'space-between' },
  macroName: { fontSize: 12, fontWeight: 600, color: '#4b5563' },
  macroVal: { fontSize: 12, color: '#6b7280' },
};
