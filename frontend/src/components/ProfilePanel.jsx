import { useState, useEffect } from 'react';
import { updateUser } from '../api/client';
import { computeTDEE, computeProteinTarget, computeFiberTarget } from '../utils/targets';

const ACTIVITY_LABELS = {
  sedentary:  'Sedentary (little/no exercise)',
  light:      'Light (1–3 days/week)',
  moderate:   'Moderate (3–5 days/week)',
  active:     'Active (6–7 days/week)',
  very_active: 'Very Active (hard exercise daily)',
};

export default function ProfilePanel({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:                 user.name             || '',
    gender:               user.gender           || '',
    age:                  user.age              || '',
    weight_kg:            user.weight_kg        || '',
    height_cm:            user.height_cm        || '',
    activity_level:       user.activity_level   || 'moderate',
    daily_calorie_target: user.daily_calorie_target || '',
    target_weight_kg:     user.target_weight_kg || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  // Computed hints — update live as form changes
  const previewUser = {
    ...form,
    weight_kg:  parseFloat(form.weight_kg)  || null,
    height_cm:  parseFloat(form.height_cm)  || null,
    age:        parseInt(form.age)          || null,
  };
  const tdee         = computeTDEE(previewUser);
  const proteinTarget = computeProteinTarget(previewUser.weight_kg);
  const fiberTarget   = computeFiberTarget(form.gender, form.age);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name:           form.name,
        gender:         form.gender   || undefined,
        age:            form.age      ? parseInt(form.age)               : undefined,
        weight_kg:      form.weight_kg ? parseFloat(form.weight_kg)      : undefined,
        height_cm:      form.height_cm ? parseFloat(form.height_cm)      : undefined,
        activity_level: form.activity_level,
        daily_calorie_target: form.daily_calorie_target
          ? parseInt(form.daily_calorie_target) : undefined,
        target_weight_kg: form.target_weight_kg
          ? parseFloat(form.target_weight_kg) : undefined,
      };
      const updated = await updateUser(user.id, payload);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Profile & Targets</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} style={styles.form}>

          {/* ── Personal info ── */}
          <p style={styles.sectionLabel}>Personal Info</p>

          <label style={styles.label}>Name *</label>
          <input required style={styles.input} value={form.name} onChange={set('name')} />

          <label style={styles.label}>Gender</label>
          <select style={styles.input} value={form.gender} onChange={set('gender')}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>

          <div style={styles.row2}>
            <div style={styles.col}>
              <label style={styles.label}>Age</label>
              <input style={styles.input} type="number" min="1" max="130"
                placeholder="e.g. 28" value={form.age} onChange={set('age')} />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Weight (kg)</label>
              <input style={styles.input} type="number" step="0.1"
                placeholder="e.g. 65" value={form.weight_kg} onChange={set('weight_kg')} />
            </div>
          </div>

          <div style={styles.row2}>
            <div style={styles.col}>
              <label style={styles.label}>Height (cm)</label>
              <input style={styles.input} type="number" step="0.1"
                placeholder="e.g. 165" value={form.height_cm} onChange={set('height_cm')} />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Goal Weight (kg)</label>
              <input style={styles.input} type="number" step="0.1"
                placeholder="e.g. 60" value={form.target_weight_kg} onChange={set('target_weight_kg')} />
            </div>
          </div>

          <label style={styles.label}>Activity Level</label>
          <select style={styles.input} value={form.activity_level} onChange={set('activity_level')}>
            {Object.entries(ACTIVITY_LABELS).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>

          {/* ── Daily targets ── */}
          <p style={{ ...styles.sectionLabel, marginTop: 20 }}>Daily Targets</p>

          <label style={styles.label}>
            Calorie Target (kcal)
            {tdee && (
              <span style={styles.hint}> — TDEE auto-estimate: {tdee} kcal</span>
            )}
          </label>
          <input style={styles.input} type="number" min="500" max="10000"
            placeholder={tdee ? `Leave blank to use TDEE (${tdee})` : 'e.g. 1800'}
            value={form.daily_calorie_target}
            onChange={set('daily_calorie_target')} />

          {/* ── Computed targets (read-only) ── */}
          {(proteinTarget || fiberTarget) && (
            <div style={styles.computedBox}>
              <p style={styles.computedTitle}>Auto-computed targets</p>
              {proteinTarget && (
                <p style={styles.computedRow}>
                  <span style={{ color: '#6366f1' }}>●</span> Protein: <strong>{proteinTarget}g/day</strong>
                  <span style={styles.computedNote}> (1.6g × {parseFloat(form.weight_kg)}kg)</span>
                </p>
              )}
              {fiberTarget && (
                <p style={styles.computedRow}>
                  <span style={{ color: '#10b981' }}>●</span> Fiber: <strong>{fiberTarget}g/day</strong>
                  <span style={styles.computedNote}> (based on gender & age)</span>
                </p>
              )}
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={saving} style={styles.saveBtn}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100,
  },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
    background: '#fff', zIndex: 101, overflowY: 'auto',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column',
  },
  panelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px 0', position: 'sticky', top: 0, background: '#fff',
    borderBottom: '1px solid #f3f4f6', paddingBottom: 16,
  },
  panelTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 18, cursor: 'pointer',
    color: '#6b7280', padding: 4, lineHeight: 1,
  },
  form: { padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 8 },
  sectionLabel: { margin: '4px 0 2px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  hint: { fontSize: 11, fontWeight: 400, color: '#9ca3af' },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  col: { display: 'flex', flexDirection: 'column', gap: 4 },
  computedBox: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
  computedTitle: { margin: 0, fontSize: 12, fontWeight: 700, color: '#6b7280' },
  computedRow: { margin: 0, fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 },
  computedNote: { fontSize: 11, color: '#9ca3af' },
  error: { color: '#ef4444', fontSize: 13, margin: 0 },
  saveBtn: {
    marginTop: 8, padding: '12px', borderRadius: 8, background: '#3b82f6',
    color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
};
