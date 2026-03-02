import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { deleteMeal } from '../api/client';

const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

function getMealBadges(meal) {
  const badges = [];
  const p = parseFloat(meal.protein_g) || 0;
  const f = parseFloat(meal.fiber_g) || 0;
  if (p >= 15) badges.push({ label: 'High Protein', color: '#6366f1' });
  if (f >= 5)  badges.push({ label: 'Good Fiber',   color: '#10b981' });
  if (p >= 10 && f >= 3) badges.push({ label: 'Balanced', color: '#3b82f6' });
  return badges;
}

export default function MealCard({ mealType, meal, userId, date, onMealRecorded, onMealDeleted }) {
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showMacros, setShowMacros] = useState(false);

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

  const badges = meal ? getMealBadges(meal) : [];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>
          {MEAL_EMOJI[mealType]} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </span>
        {meal && <span style={styles.calories}>{meal.total_calories} kcal</span>}
      </div>

      {meal ? (
        <div>
          {/* Badges */}
          {badges.length > 0 && (
            <div style={styles.badges}>
              {badges.map((b) => (
                <span key={b.label} style={{ ...styles.badge, background: b.color + '1a', color: b.color }}>
                  {b.label}
                </span>
              ))}
            </div>
          )}

          {/* Macro summary row */}
          {(parseFloat(meal.protein_g) > 0 || parseFloat(meal.fiber_g) > 0) && (
            <div style={styles.macroSummary}>
              <span style={styles.macroChip}>🥩 {parseFloat(meal.protein_g || 0).toFixed(1)}g protein</span>
              <span style={styles.macroChip}>🌾 {parseFloat(meal.fiber_g || 0).toFixed(1)}g fiber</span>
              <span style={styles.macroChip}>🍞 {parseFloat(meal.carbs_g || 0).toFixed(1)}g carbs</span>
              <span style={styles.macroChip}>🧈 {parseFloat(meal.fat_g || 0).toFixed(1)}g fat</span>
            </div>
          )}

          {/* Food list */}
          <ul style={styles.foodList}>
            {(meal.foods || []).map((f, i) => (
              <li key={i} style={styles.foodItem}>
                <span style={styles.foodName}>{f.name}</span>
                <span style={styles.foodRight}>
                  <span style={styles.foodCal}>{f.calories} kcal</span>
                  {showMacros && f.protein_g > 0 && (
                    <span style={styles.foodMacro}>
                      P:{f.protein_g}g F:{f.fiber_g}g C:{f.carbs_g}g
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div style={styles.actions}>
            <button onClick={() => setShowMacros((v) => !v)} style={styles.toggleBtn}>
              {showMacros ? 'Hide macros' : 'Per-food macros'}
            </button>
            <button onClick={handleDelete} disabled={deleting} style={styles.deleteBtn}>
              {deleting ? 'Deleting…' : '🗑 Remove'}
            </button>
          </div>

          {meal.audio_transcript && (
            <p style={styles.transcript}>"{meal.audio_transcript}"</p>
          )}
        </div>
      ) : (
        <VoiceRecorder
          mealType={mealType}
          userId={userId}
          date={date}
          onMealRecorded={(meal, confidence) => {
            setError(null);
            onMealRecorded?.(meal, confidence);
          }}
          onError={setError}
        />
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 10 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 700, fontSize: 16 },
  calories: { background: '#dcfce7', color: '#16a34a', fontWeight: 700, padding: '2px 10px', borderRadius: 20, fontSize: 14 },
  badges: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  badge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 },
  macroSummary: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  macroChip: { fontSize: 11, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: '2px 8px' },
  foodList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  foodItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f3f4f6' },
  foodName: { flex: 1, marginRight: 8 },
  foodRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  foodCal: { color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' },
  foodMacro: { fontSize: 10, color: '#9ca3af' },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  toggleBtn: { background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 },
  deleteBtn: { background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 },
  transcript: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', margin: 0 },
  error: { color: '#ef4444', fontSize: 13, margin: 0 },
};
