import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { deleteMeal } from '../api/client';

export default function MiscSnackSection({ userId, date, miscMeals, onAdded, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]           = useState('');

  async function handleDelete(id) {
    setDeletingId(id);
    setError('');
    try {
      await deleteMeal(id);
      onDeleted?.(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const totalCal     = miscMeals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const totalProtein = miscMeals.reduce((s, m) => s + parseFloat(m.protein_g || 0), 0);
  const totalFiber   = miscMeals.reduce((s, m) => s + parseFloat(m.fiber_g   || 0), 0);

  return (
    <div style={styles.card} className="card-hover">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <span style={styles.emoji}>🫙</span>
          <span style={styles.titleText}>Misc / Snacking</span>
          <span style={styles.hint}>— add as many times as you like</span>
        </div>
        {totalCal > 0 && (
          <span style={styles.totalBadge}>{totalCal} kcal</span>
        )}
      </div>

      <div style={styles.body}>
        {/* Recorded items list */}
        {miscMeals.length > 0 && (
          <div style={styles.log}>
            {miscMeals.map((m) => (
              <div key={m.id} style={styles.logRow}>
                <div style={styles.logLeft}>
                  <span style={styles.logName}>
                    {(m.foods && m.foods.length > 0)
                      ? m.foods.map((f) => f.name).join(', ')
                      : m.audio_transcript || 'Snack'}
                  </span>
                  {m.audio_transcript && (
                    <span style={styles.logTranscript}>"{m.audio_transcript}"</span>
                  )}
                  {(parseFloat(m.protein_g) > 0 || parseFloat(m.fiber_g) > 0) && (
                    <span style={styles.logMacros}>
                      {parseFloat(m.protein_g) > 0 && `P ${parseFloat(m.protein_g).toFixed(1)}g`}
                      {parseFloat(m.protein_g) > 0 && parseFloat(m.fiber_g) > 0 && '  ·  '}
                      {parseFloat(m.fiber_g) > 0   && `Fiber ${parseFloat(m.fiber_g).toFixed(1)}g`}
                    </span>
                  )}
                </div>
                <div style={styles.logRight}>
                  <span style={styles.logCal}>{m.total_calories} kcal</span>
                  <button
                    style={styles.removeBtn}
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    title="Remove"
                  >
                    {deletingId === m.id ? '…' : '×'}
                  </button>
                </div>
              </div>
            ))}

            {/* Subtotal row */}
            {miscMeals.length > 1 && (
              <div style={styles.subtotalRow}>
                <span style={styles.subtotalLabel}>Total</span>
                <div style={styles.subtotalRight}>
                  {(totalProtein > 0 || totalFiber > 0) && (
                    <span style={styles.subtotalMacros}>
                      {totalProtein > 0 && `P ${totalProtein.toFixed(1)}g`}
                      {totalProtein > 0 && totalFiber > 0 && '  ·  '}
                      {totalFiber > 0   && `Fiber ${totalFiber.toFixed(1)}g`}
                    </span>
                  )}
                  <span style={styles.subtotalCal}>{totalCal} kcal</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice recorder — always visible to add more */}
        <VoiceRecorder
          mealType="misc"
          userId={userId}
          date={date}
          onMealRecorded={(meal) => { setError(''); onAdded?.(meal); }}
          onError={setError}
        />

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EBEBEB',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', background: '#F5F3FF',
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  emoji:     { fontSize: 18 },
  titleText: { fontWeight: 700, fontSize: 15, color: '#1A1A1A' },
  hint:      { fontSize: 12, color: '#9CA3AF' },
  totalBadge: {
    fontWeight: 700, fontSize: 13, color: '#7C3AED',
    background: '#fff', border: '1px solid #C4B5FD',
    padding: '3px 10px', borderRadius: 20,
  },
  body: { padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  log: {
    background: '#F9F9F9', borderRadius: 10,
    border: '1px solid #EBEBEB', overflow: 'hidden',
  },
  logRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 12px', borderBottom: '1px solid #F0F0F0', gap: 12,
  },
  logLeft:  { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 },
  logName:  { fontSize: 13, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.4 },
  logTranscript: { fontSize: 11, color: '#B0B0B0', fontStyle: 'italic' },
  logMacros:     { fontSize: 11, color: '#9CA3AF' },
  logRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  logCal:   { fontSize: 13, fontWeight: 700, color: '#717171' },
  removeBtn: {
    width: 22, height: 22, borderRadius: '50%', border: 'none',
    background: '#EBEBEB', color: '#717171', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1, flexShrink: 0,
  },
  subtotalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', background: '#F0F0F0',
  },
  subtotalLabel: { fontSize: 12, fontWeight: 700, color: '#717171', textTransform: 'uppercase', letterSpacing: '0.04em' },
  subtotalRight: { display: 'flex', alignItems: 'center', gap: 12 },
  subtotalMacros: { fontSize: 11, color: '#9CA3AF' },
  subtotalCal:    { fontSize: 13, fontWeight: 800, color: '#1A1A1A' },
  error: { margin: 0, fontSize: 13, color: '#DC2626', fontWeight: 500 },
};
