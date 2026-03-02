import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { deleteMeal } from '../api/client';

const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

export default function MealCard({ mealType, meal, userId, date, onMealRecorded, onMealDeleted }) {
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>
          {MEAL_EMOJI[mealType]} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </span>
        {meal && <span style={styles.calories}>{meal.total_calories} kcal</span>}
      </div>

      {meal ? (
        <div>
          <ul style={styles.foodList}>
            {(meal.foods || []).map((f, i) => (
              <li key={i} style={styles.foodItem}>
                <span>{f.name}</span>
                <span style={styles.foodCal}>{f.calories} kcal</span>
              </li>
            ))}
          </ul>
          {meal.audio_transcript && (
            <p style={styles.transcript}>"{meal.audio_transcript}"</p>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={styles.deleteBtn}
          >
            {deleting ? 'Deleting…' : '🗑 Remove'}
          </button>
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
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 700, fontSize: 16 },
  calories: {
    background: '#dcfce7',
    color: '#16a34a',
    fontWeight: 700,
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 14,
  },
  foodList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  foodItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    padding: '4px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  foodCal: { color: '#6b7280', fontWeight: 500 },
  transcript: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginTop: 8 },
  deleteBtn: {
    background: 'none',
    border: '1px solid #fca5a5',
    color: '#ef4444',
    borderRadius: 6,
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 13,
    marginTop: 4,
  },
  error: { color: '#ef4444', fontSize: 13, margin: 0 },
};
