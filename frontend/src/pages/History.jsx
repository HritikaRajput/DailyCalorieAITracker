import { useState, useEffect, useCallback } from 'react';
import CalorieChart from '../components/CalorieChart';
import { getMeals, getMealsSummary } from '../api/client';

const MEAL_META = {
  breakfast: { color: '#F59E0B', bg: '#FFFBEB' },
  lunch:     { color: '#22C55E', bg: '#F0FDF4' },
  dinner:    { color: '#6366F1', bg: '#EEF2FF' },
  snack:     { color: '#F97316', bg: '#FFF7ED' },
};

export default function History() {
  const user = JSON.parse(localStorage.getItem('calorie_tracker_user') || 'null');
  const [days, setDays]               = useState(30);
  const [summary, setSummary]         = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayMeals, setDayMeals]       = useState([]);
  const [loading, setLoading]         = useState(false);

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
    return <div style={styles.page}><p style={{ color: '#717171' }}>Please create a profile on the Dashboard first.</p></div>;
  }

  const totalAll    = summary.reduce((s, d) => s + d.total_calories, 0);
  const avgCalories = summary.length ? Math.round(totalAll / summary.length) : 0;
  const maxDay      = summary.length ? Math.max(...summary.map((d) => d.total_calories)) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>History</h1>
          <p style={styles.sub}>Your calorie & nutrition log</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={styles.select}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        <StatCard icon="📅" label="Days logged"   value={summary.length} />
        <StatCard icon="📊" label="Daily average"  value={`${avgCalories.toLocaleString()} kcal`} />
        <StatCard icon="🔥" label="Total calories" value={totalAll.toLocaleString()} sub="kcal" />
        <StatCard icon="📈" label="Best day"       value={maxDay ? `${maxDay.toLocaleString()} kcal` : '—'} />
      </div>

      {/* Chart */}
      {loading ? (
        <div style={styles.loadingWrap}><span style={styles.spinner} /></div>
      ) : (
        <CalorieChart
          data={summary}
          targetCalories={user.daily_calorie_target}
          title={`Daily calories — last ${days} days`}
        />
      )}

      {/* Table */}
      {summary.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Daily breakdown</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Date', 'Calories', 'vs Target', ''].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...summary].reverse().map((row) => {
                  const diff = user.daily_calorie_target
                    ? row.total_calories - user.daily_calorie_target
                    : null;
                  const isSelected = selectedDate === row.date;
                  return (
                    <tr key={row.date} style={{ ...styles.tr, background: isSelected ? '#F7F7FF' : undefined }}>
                      <td style={styles.td}>
                        {new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>
                        {row.total_calories.toLocaleString()} kcal
                      </td>
                      <td style={styles.td}>
                        {diff === null ? (
                          <span style={{ color: '#B0B0B0' }}>—</span>
                        ) : diff > 0 ? (
                          <span style={styles.overChip}>+{diff}</span>
                        ) : (
                          <span style={styles.underChip}>{diff}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{ ...styles.viewBtn, background: isSelected ? '#EEF2FF' : '#F7F7F7', color: isSelected ? '#6366F1' : '#717171' }}
                          onClick={() => handleDateClick(row.date)}
                        >
                          {isSelected ? 'Viewing' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day detail drawer */}
      {selectedDate && (
        <div style={styles.drawer}>
          <div style={styles.drawerHeader}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </h3>
            <button onClick={() => setSelectedDate(null)} style={styles.closeBtn}>✕</button>
          </div>
          {dayMeals.length === 0 ? (
            <p style={{ color: '#B0B0B0', margin: 0, fontSize: 14 }}>No meals logged this day.</p>
          ) : (
            <div style={styles.mealList}>
              {dayMeals.map((m) => {
                const meta = MEAL_META[m.meal_type] || {};
                return (
                  <div key={m.id} style={styles.mealRow}>
                    <span style={{ ...styles.mealTypeBadge, color: meta.color, background: meta.bg }}>
                      {m.meal_type}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{m.total_calories.toLocaleString()} kcal</span>
                    {m.audio_transcript && (
                      <span style={styles.transcript}>"{m.audio_transcript}"</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div style={stat.card} className="card-hover">
      <span style={stat.icon}>{icon}</span>
      <p style={stat.label}>{label}</p>
      <p style={stat.value}>{value}</p>
    </div>
  );
}

const stat = {
  card: {
    background: '#fff', borderRadius: 16, padding: '20px 20px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EBEBEB',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  icon:  { fontSize: 22 },
  label: { margin: 0, fontSize: 12, color: '#717171', fontWeight: 500, marginTop: 4 },
  value: { margin: 0, fontSize: 22, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' },
};

const styles = {
  page: {
    maxWidth: 900, margin: '0 auto',
    padding: '32px 24px 48px',
    display: 'flex', flexDirection: 'column', gap: 28,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 },
  h1: { margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' },
  sub: { margin: '4px 0 0', color: '#717171', fontSize: 14 },
  select: {
    padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #EBEBEB', fontSize: 14, color: '#1A1A1A',
    background: '#fff', cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12,
  },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: 40 },
  spinner: {
    width: 32, height: 32, border: '3px solid #EBEBEB', borderTopColor: '#1A1A1A',
    borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
  sectionTitle: { margin: '0 0 12px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.2px' },
  tableWrap: { borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EBEBEB' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  th: { padding: '12px 18px', textAlign: 'left', background: '#F7F7F7', fontSize: 12, fontWeight: 600, color: '#717171', letterSpacing: '0.04em', textTransform: 'uppercase' },
  tr: { borderTop: '1px solid #F0F0F0' },
  td: { padding: '13px 18px', fontSize: 14, color: '#1A1A1A' },
  overChip:  { fontSize: 12, fontWeight: 600, color: '#DC2626', background: '#FFF5F5', padding: '3px 8px', borderRadius: 20 },
  underChip: { fontSize: 12, fontWeight: 600, color: '#15803D', background: '#F0FDF4', padding: '3px 8px', borderRadius: 20 },
  viewBtn: {
    border: 'none', borderRadius: 8, padding: '6px 12px',
    cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
  },
  drawer: {
    background: '#fff', borderRadius: 16, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EBEBEB',
    display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.2s ease',
  },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#B0B0B0', padding: 4, lineHeight: 1 },
  mealList: { display: 'flex', flexDirection: 'column', gap: 8 },
  mealRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F7F7F7', flexWrap: 'wrap' },
  mealTypeBadge: { fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '4px 10px', textTransform: 'capitalize', flexShrink: 0 },
  transcript: { fontSize: 12, color: '#B0B0B0', fontStyle: 'italic', flex: 1 },
};
