import { useState, useEffect } from 'react';
import { updateUser } from '../api/client';
import {
  computeTDEE, computeProteinTarget, computeFiberTarget,
  computeCalorieTarget, computeWeeksToGoal,
  GOAL_PACE_META, GOAL_PACE_ADJUSTMENTS,
} from '../utils/targets';

const ACTIVITY_LABELS = {
  sedentary:   'Sedentary (little/no exercise)',
  light:       'Light (1–3 days/week)',
  moderate:    'Moderate (3–5 days/week)',
  active:      'Active (6–7 days/week)',
  very_active: 'Very Active (hard exercise daily)',
};

const TABS = ['Profile', 'Goals'];

// ─── Profile tab ────────────────────────────────────────────────────────────
function ProfileTab({ form, set }) {
  const previewUser = {
    ...form,
    weight_kg: parseFloat(form.weight_kg) || null,
    height_cm: parseFloat(form.height_cm) || null,
    age:       parseInt(form.age)         || null,
  };
  const tdee          = computeTDEE(previewUser);
  const proteinTarget = computeProteinTarget(previewUser.weight_kg);
  const fiberTarget   = computeFiberTarget(form.gender, form.age);

  return (
    <div style={tabStyles.container}>
      <SectionLabel>Personal Info</SectionLabel>

      <Field label="Name *">
        <input required style={tabStyles.input} value={form.name} onChange={set('name')} />
      </Field>

      <Field label="Gender">
        <select style={tabStyles.input} value={form.gender} onChange={set('gender')}>
          <option value="">Prefer not to say</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <div style={tabStyles.row2}>
        <Field label="Age">
          <input style={tabStyles.input} type="number" min="1" max="130"
            placeholder="e.g. 28" value={form.age} onChange={set('age')} />
        </Field>
        <Field label="Weight (kg)">
          <input style={tabStyles.input} type="number" step="0.1"
            placeholder="e.g. 65" value={form.weight_kg} onChange={set('weight_kg')} />
        </Field>
      </div>

      <div style={tabStyles.row2}>
        <Field label="Height (cm)">
          <input style={tabStyles.input} type="number" step="0.1"
            placeholder="e.g. 165" value={form.height_cm} onChange={set('height_cm')} />
        </Field>
        <Field label="Goal Weight (kg)">
          <input style={tabStyles.input} type="number" step="0.1"
            placeholder="e.g. 60" value={form.target_weight_kg} onChange={set('target_weight_kg')} />
        </Field>
      </div>

      <Field label="Activity Level">
        <select style={tabStyles.input} value={form.activity_level} onChange={set('activity_level')}>
          {Object.entries(ACTIVITY_LABELS).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
      </Field>

      {(proteinTarget || fiberTarget || tdee) && (
        <div style={tabStyles.computedBox}>
          <p style={tabStyles.computedTitle}>Auto-computed from your profile</p>
          {tdee && (
            <ComputedRow color="#3b82f6" label="TDEE" value={`${tdee} kcal/day`} note="maintenance calories" />
          )}
          {proteinTarget && (
            <ComputedRow color="#6366f1" label="Protein" value={`${proteinTarget}g/day`} note={`1.6g × ${parseFloat(form.weight_kg)}kg`} />
          )}
          {fiberTarget && (
            <ComputedRow color="#10b981" label="Fiber" value={`${fiberTarget}g/day`} note="based on gender & age" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Goals tab ───────────────────────────────────────────────────────────────
// Designed to be self-contained — easy to promote to its own page/route later.
function GoalsTab({ form, set }) {
  const previewUser = {
    ...form,
    weight_kg:        parseFloat(form.weight_kg)        || null,
    target_weight_kg: parseFloat(form.target_weight_kg) || null,
    age:              parseInt(form.age)                || null,
  };

  const tdee           = computeTDEE(previewUser);
  const adjustedTarget = computeCalorieTarget({ ...previewUser, daily_calorie_target: form.daily_calorie_target || null });
  const weeksToGoal    = computeWeeksToGoal(previewUser);

  const direction = previewUser.weight_kg && previewUser.target_weight_kg
    ? previewUser.target_weight_kg < previewUser.weight_kg ? 'lose'
    : previewUser.target_weight_kg > previewUser.weight_kg ? 'gain'
    : 'maintain'
    : null;

  return (
    <div style={tabStyles.container}>
      <SectionLabel>Goal Pace</SectionLabel>
      <p style={tabStyles.hint}>How fast do you want to reach your goal weight?</p>

      <div style={tabStyles.paceGrid}>
        {Object.entries(GOAL_PACE_META).map(([pace, meta]) => {
          const selected = form.goal_pace === pace;
          return (
            <button
              key={pace}
              type="button"
              onClick={() => set('goal_pace')({ target: { value: pace } })}
              style={{
                ...tabStyles.paceCard,
                borderColor: selected ? meta.color : '#e5e7eb',
                background:  selected ? meta.color + '12' : '#fff',
              }}
            >
              <span style={{ ...tabStyles.paceName, color: selected ? meta.color : '#111827' }}>
                {meta.label}
              </span>
              {meta.rate && (
                <span style={tabStyles.paceRate}>{meta.rate}</span>
              )}
              <span style={tabStyles.paceDesc}>{meta.desc}</span>
            </button>
          );
        })}
      </div>

      <SectionLabel>Calorie Target</SectionLabel>
      <Field label={
        <span>
          Manual override
          <span style={tabStyles.hint}> — leave blank to auto-compute from pace</span>
        </span>
      }>
        <input style={tabStyles.input} type="number" min="500" max="10000"
          placeholder={adjustedTarget ? `Auto: ${adjustedTarget} kcal` : 'e.g. 1800'}
          value={form.daily_calorie_target}
          onChange={set('daily_calorie_target')} />
      </Field>

      {/* Live summary */}
      {(tdee || adjustedTarget) && (
        <div style={tabStyles.summaryBox}>
          <p style={tabStyles.computedTitle}>Your plan</p>
          {tdee && (
            <ComputedRow color="#6b7280" label="TDEE" value={`${tdee} kcal`} note="maintenance" />
          )}
          {adjustedTarget && form.goal_pace && form.goal_pace !== 'maintain' && (
            <>
              <ComputedRow
                color={GOAL_PACE_META[form.goal_pace]?.color || '#3b82f6'}
                label="Target"
                value={`${adjustedTarget} kcal/day`}
                note={
                  direction === 'lose' ? `−${GOAL_PACE_ADJUSTMENTS[form.goal_pace]} kcal deficit` :
                  direction === 'gain' ? `+${GOAL_PACE_ADJUSTMENTS[form.goal_pace]} kcal surplus` :
                  'set goal weight to see direction'
                }
              />
              {weeksToGoal && (
                <ComputedRow
                  color="#f59e0b"
                  label="Est. timeline"
                  value={weeksToGoal >= 52
                    ? `~${(weeksToGoal / 52).toFixed(1)} years`
                    : `~${weeksToGoal} weeks`}
                  note={`to reach ${form.target_weight_kg} kg`}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <p style={tabStyles.sectionLabel}>{children}</p>;
}

function Field({ label, children }) {
  return (
    <div style={tabStyles.field}>
      <label style={tabStyles.label}>{label}</label>
      {children}
    </div>
  );
}

function ComputedRow({ color, label, value, note }) {
  return (
    <p style={tabStyles.computedRow}>
      <span style={{ color, fontSize: 10 }}>●</span>
      <span style={tabStyles.computedLabel}>{label}:</span>
      <strong>{value}</strong>
      {note && <span style={tabStyles.computedNote}> ({note})</span>}
    </p>
  );
}

// ─── Panel shell ─────────────────────────────────────────────────────────────
export default function ProfilePanel({ user, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [form, setForm] = useState({
    name:                 user.name                || '',
    gender:               user.gender              || '',
    age:                  user.age                 || '',
    weight_kg:            user.weight_kg           || '',
    height_cm:            user.height_cm           || '',
    activity_level:       user.activity_level      || 'moderate',
    goal_pace:            user.goal_pace           || 'maintain',
    daily_calorie_target: user.daily_calorie_target || '',
    target_weight_kg:     user.target_weight_kg    || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateUser(user.id, {
        name:           form.name,
        gender:         form.gender        || undefined,
        age:            form.age           ? parseInt(form.age)             : undefined,
        weight_kg:      form.weight_kg     ? parseFloat(form.weight_kg)     : undefined,
        height_cm:      form.height_cm     ? parseFloat(form.height_cm)     : undefined,
        activity_level: form.activity_level,
        goal_pace:      form.goal_pace,
        daily_calorie_target: form.daily_calorie_target
          ? parseInt(form.daily_calorie_target) : undefined,
        target_weight_kg: form.target_weight_kg
          ? parseFloat(form.target_weight_kg) : undefined,
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.panel}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Tab bar ── */}
        <div style={styles.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <form onSubmit={handleSave} style={styles.formWrap}>
          {activeTab === 'Profile' && <ProfileTab form={form} set={set} />}
          {activeTab === 'Goals'   && <GoalsTab   form={form} set={set} />}

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={saving} style={styles.saveBtn}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

      </div>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
    background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6',
    flexShrink: 0,
  },
  title:    { margin: 0, fontSize: 18, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280', padding: 4, lineHeight: 1 },
  tabBar: {
    display: 'flex', padding: '0 24px', gap: 4,
    borderBottom: '1px solid #f3f4f6', flexShrink: 0, background: '#fff',
  },
  tab: {
    padding: '10px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent',
    cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#6b7280', marginBottom: -1,
  },
  tabActive: { color: '#3b82f6', borderBottomColor: '#3b82f6', fontWeight: 700 },
  formWrap: { flex: 1, overflowY: 'auto', padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 12 },
  error:    { color: '#ef4444', fontSize: 13, margin: 0 },
  saveBtn: {
    marginTop: 4, padding: '12px', borderRadius: 8, background: '#3b82f6',
    color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', flexShrink: 0,
  },
};

const tabStyles = {
  container: { display: 'flex', flexDirection: 'column', gap: 10 },
  sectionLabel: { margin: '8px 0 0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af' },
  hint: { margin: 0, fontSize: 12, color: '#9ca3af' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  computedBox: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
  summaryBox:  { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
  computedTitle: { margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#6b7280' },
  computedRow:   { margin: 0, fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  computedLabel: { color: '#6b7280', minWidth: 52 },
  computedNote:  { fontSize: 11, color: '#9ca3af' },
  paceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  paceCard: {
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '12px', borderRadius: 10, border: '2px solid',
    cursor: 'pointer', textAlign: 'left', background: '#fff',
    transition: 'border-color 0.15s, background 0.15s',
  },
  paceName: { fontSize: 14, fontWeight: 700 },
  paceRate: { fontSize: 12, fontWeight: 600, color: '#6b7280' },
  paceDesc: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
};
