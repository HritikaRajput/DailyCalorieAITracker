import { useState, useEffect, useCallback } from 'react';
import CalorieChart from '../components/CalorieChart';
import { getMeals, getMealsSummary } from '../api/client';

export default function History() {
  const user = JSON.parse(localStorage.getItem('calorie_tracker_user') || 'null');
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayMeals, setDayMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMealsSummary(user.id, days);
      setSummary(data.summary || []);
    } finally {
      setLoading(false);
    }
  }, [user?.id, days]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  async function handleDateClick(date) {
    setSelectedDate(date);
    const data = await getMeals(user.id, date);
    setDayMeals(data.meals || []);
  }

  if (!user) {
    return <div style={styles.page}><p>Please create a profile on the Dashboard first.</p></div>;
  }

  const totalAll = summary.reduce((s, d) => s + d.total_calories, 0);
  const avgCalories = summary.length ? Math.round(totalAll / summary.length) : 0;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>History</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={styles.select}
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </header>

      <div style={styles.statsRow}>
        <StatBox label="Days Logged" value={summary.length} />
        <StatBox label="Avg Daily" value={`${avgCalories} kcal`} />
        <StatBox label="Total" value={`${totalAll.toLocaleString()} kcal`} />
      </div>

      {loading ? (
        <p style={styles.loading}>Loading…</p>
      ) : (
        <CalorieChart
          data={summary}
          targetCalories={user.daily_calorie_target}
          title={`Calories — Last ${days} Days`}
        />
      )}

      {summary.length > 0 && (
        <section>
          <h2 style={styles.sectionTitle}>Daily Breakdown</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Total Calories</th>
                <th style={styles.th}>vs Target</th>
                <th style={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              {[...summary].reverse().map((row) => {
                const diff = user.daily_calorie_target
                  ? row.total_calories - user.daily_calorie_target
                  : null;
                return (
                  <tr key={row.date} style={styles.tr}>
                    <td style={styles.td}>{new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td style={styles.td}>{row.total_calories} kcal</td>
                    <td style={{ ...styles.td, color: diff > 0 ? '#ef4444' : diff < 0 ? '#16a34a' : '#6b7280' }}>
                      {diff === null ? '—' : diff > 0 ? `+${diff}` : `${diff}`}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.detailBtn} onClick={() => handleDateClick(row.date)}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {selectedDate && (
        <div style={styles.drawer}>
          <div style={styles.drawerHeader}>
            <h3 style={{ margin: 0 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDate(null)} style={styles.closeBtn}>✕</button>
          </div>
          {dayMeals.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No meals logged.</p>
          ) : (
            dayMeals.map((m) => (
              <div key={m.id} style={styles.mealRow}>
                <span style={styles.mealType}>{m.meal_type}</span>
                <span>{m.total_calories} kcal</span>
                <span style={styles.mealTranscript}>"{m.audio_transcript}"</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={statStyles.box}>
      <p style={statStyles.label}>{label}</p>
      <p style={statStyles.value}>{value}</p>
    </div>
  );
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  h1: { margin: 0, fontSize: 28, fontWeight: 800 },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  sectionTitle: { margin: '0 0 12px', fontSize: 18, fontWeight: 700 },
  loading: { color: '#9ca3af', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  th: { padding: '12px 16px', textAlign: 'left', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151' },
  tr: { borderTop: '1px solid #f3f4f6' },
  td: { padding: '12px 16px', fontSize: 14 },
  detailBtn: { background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 500 },
  drawer: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 12 },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' },
  mealRow: { display: 'flex', gap: 16, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
  mealType: { background: '#eff6ff', color: '#3b82f6', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' },
  mealTranscript: { fontSize: 13, color: '#9ca3af', fontStyle: 'italic', flex: 1 },
};

const statStyles = {
  box: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  label: { margin: 0, fontSize: 13, color: '#6b7280' },
  value: { margin: '4px 0 0', fontSize: 22, fontWeight: 700 },
};
