export default function DailySummary({ totalCalories, targetCalories, date }) {
  const pct = targetCalories ? Math.min((totalCalories / targetCalories) * 100, 100) : null;
  const over = targetCalories && totalCalories > targetCalories;

  const today = new Date().toISOString().split('T')[0];
  const label = date === today ? 'Today' : date;

  return (
    <div style={styles.wrapper}>
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
        <div style={styles.barBg}>
          <div
            style={{
              ...styles.barFill,
              width: `${pct}%`,
              background: over ? '#ef4444' : '#3b82f6',
            }}
          />
        </div>
      )}

      {over && (
        <p style={styles.warning}>
          ⚠️ {(totalCalories - targetCalories).toLocaleString()} kcal over target today
        </p>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    borderRadius: 12,
    padding: 20,
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { margin: 0, fontSize: 13, color: '#6b7280' },
  total: { margin: '4px 0 0', fontSize: 32, fontWeight: 800 },
  targetBox: { textAlign: 'right' },
  target: { margin: '4px 0 0', fontSize: 18, fontWeight: 600, color: '#374151' },
  barBg: { background: '#bfdbfe', borderRadius: 99, height: 8, marginTop: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.4s ease' },
  warning: { margin: '8px 0 0', fontSize: 13, color: '#ef4444' },
};
