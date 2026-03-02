import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { deleteMeal } from '../api/client';

const MEAL_META = {
  breakfast: { emoji: '🌅', label: 'Breakfast', color: '#F59E0B', bg: '#FFFBEB' },
  lunch:     { emoji: '☀️',  label: 'Lunch',     color: '#22C55E', bg: '#F0FDF4' },
  dinner:    { emoji: '🌙', label: 'Dinner',    color: '#6366F1', bg: '#EEF2FF' },
  snack:     { emoji: '🍎', label: 'Snack',     color: '#F97316', bg: '#FFF7ED' },
};

function getMealBadges(meal) {
  const badges = [];
  const p = parseFloat(meal.protein_g) || 0;
  const f = parseFloat(meal.fiber_g)   || 0;
  if (p >= 15) badges.push({ label: 'High Protein', color: '#6366F1', bg: '#EEF2FF' });
  if (f >= 5)  badges.push({ label: 'Good Fiber',   color: '#22C55E', bg: '#F0FDF4' });
  if (p >= 10 && f >= 3) badges.push({ label: 'Balanced', color: '#3B82F6', bg: '#EFF6FF' });
  return badges;
}

export default function MealCard({ mealType, meal, userId, date, onMealRecorded, onMealDeleted }) {
  const [error, setError]       = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showMacros, setShowMacros] = useState(false);

  const meta   = MEAL_META[mealType] || MEAL_META.snack;
  const badges = meal ? getMealBadges(meal) : [];

  async function handleDelete() {
    if (!meal) return;
    setDeleting(true);
    try {
      await deleteMeal(meal.id);
      onMealDeleted?.(meal.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={styles.card} className="card-hover">
      {/* Header */}
      <div style={{ ...styles.header, background: meta.bg }}>
        <div style={styles.mealTitle}>
          <span style={styles.emoji}>{meta.emoji}</span>
          <span style={styles.titleText}>{meta.label}</span>
        </div>
        {meal && (
          <span style={{ ...styles.calBadge, color: meta.color, border: `1px solid ${meta.color}30` }}>
            {meal.total_calories} kcal
          </span>
        )}
      </div>

      {/* Body */}
      <div style={styles.body}>
        {meal ? (
          <>
            {badges.length > 0 && (
              <div style={styles.badges}>
                {badges.map((b) => (
                  <span key={b.label} style={{ ...styles.badge, color: b.color, background: b.bg }}>
                    {b.label}
                  </span>
                ))}
              </div>
            )}

            {(parseFloat(meal.protein_g) > 0 || parseFloat(meal.fiber_g) > 0) && (
              <div style={styles.macroRow}>
                <MacroChip icon="💪" value={`${parseFloat(meal.protein_g || 0).toFixed(1)}g`} label="protein" />
                <MacroChip icon="🌾" value={`${parseFloat(meal.fiber_g || 0).toFixed(1)}g`}   label="fiber"   />
                <MacroChip icon="🍞" value={`${parseFloat(meal.carbs_g || 0).toFixed(1)}g`}   label="carbs"   />
                <MacroChip icon="🫙" value={`${parseFloat(meal.fat_g || 0).toFixed(1)}g`}     label="fat"     />
              </div>
            )}

            <ul style={styles.foodList}>
              {(meal.foods || []).map((f, i) => (
                <li key={i} style={styles.foodItem}>
                  <span style={styles.foodName}>{f.name}</span>
                  <div style={styles.foodRight}>
                    <span style={styles.foodCal}>{f.calories} kcal</span>
                    {showMacros && f.protein_g > 0 && (
                      <span style={styles.foodMacro}>
                        P {f.protein_g}g · F {f.fiber_g}g · C {f.carbs_g}g
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {meal.audio_transcript && (
              <p style={styles.transcript}>"{meal.audio_transcript}"</p>
            )}

            <div style={styles.actions}>
              <button style={styles.ghostBtn} className="btn-hover" onClick={() => setShowMacros((v) => !v)}>
                {showMacros ? 'Hide macros' : 'Per-food macros'}
              </button>
              <button style={styles.deleteBtn} className="btn-hover" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </>
        ) : (
          <VoiceRecorder
            mealType={mealType}
            userId={userId}
            date={date}
            onMealRecorded={(m, confidence) => { setError(null); onMealRecorded?.(m, confidence); }}
            onError={setError}
          />
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

function MacroChip({ icon, value, label }) {
  return (
    <div style={chip.wrap}>
      <span style={chip.icon}>{icon}</span>
      <span style={chip.val}>{value}</span>
      <span style={chip.label}>{label}</span>
    </div>
  );
}

const chip = {
  wrap:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 44 },
  icon:  { fontSize: 14 },
  val:   { fontSize: 12, fontWeight: 700, color: '#1A1A1A' },
  label: { fontSize: 10, color: '#B0B0B0', fontWeight: 500 },
};

const styles = {
  card: {
    background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EBEBEB',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px',
  },
  mealTitle: { display: 'flex', alignItems: 'center', gap: 8 },
  emoji: { fontSize: 18 },
  titleText: { fontWeight: 700, fontSize: 15, color: '#1A1A1A' },
  calBadge: { fontWeight: 700, fontSize: 13, padding: '3px 10px', borderRadius: 20, background: '#fff' },
  body: { padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 },
  badges: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 },
  macroRow: { display: 'flex', gap: 8 },
  foodList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' },
  foodItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '8px 0', borderBottom: '1px solid #F7F7F7', fontSize: 13,
  },
  foodName: { flex: 1, marginRight: 8, color: '#1A1A1A', lineHeight: 1.4 },
  foodRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  foodCal: { color: '#717171', fontWeight: 600, fontSize: 13 },
  foodMacro: { fontSize: 10, color: '#B0B0B0' },
  transcript: { margin: 0, fontSize: 12, color: '#B0B0B0', fontStyle: 'italic', lineHeight: 1.5 },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  ghostBtn: {
    background: 'none', border: '1px solid #EBEBEB',
    color: '#717171', borderRadius: 8, padding: '6px 12px',
    cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'opacity 0.15s',
  },
  deleteBtn: {
    background: 'none', border: '1px solid #FECACA',
    color: '#DC2626', borderRadius: 8, padding: '6px 12px',
    cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'opacity 0.15s',
  },
  error: { color: '#DC2626', fontSize: 13, margin: 0, fontWeight: 500 },
};
