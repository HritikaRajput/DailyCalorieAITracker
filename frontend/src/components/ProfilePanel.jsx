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
    <div style={tab.container}>
      <SectionLabel>Personal info</SectionLabel>

      <Field label="Name *">
        <input required style={tab.input} value={form.name} onChange={set('name')} />
      </Field>
      <Field label="Gender">
        <select style={tab.input} value={form.gender} onChange={set('gender')}>
          <option value="">Prefer not to say</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <div style={tab.row2}>
        <Field label="Age">
          <input style={tab.input} type="number" min="1" max="130" placeholder="e.g. 28" value={form.age} onChange={set('age')} />
        </Field>
        <Field label="Weight (kg)">
          <input style={tab.input} type="number" step="0.1" placeholder="e.g. 65" value={form.weight_kg} onChange={set('weight_kg')} />
        </Field>
      </div>
      <div style={tab.row2}>
        <Field label="Height (cm)">
          <input style={tab.input} type="number" step="0.1" placeholder="e.g. 165" value={form.height_cm} onChange={set('height_cm')} />
        </Field>
        <Field label="Goal weight (kg)">
          <input style={tab.input} type="number" step="0.1" placeholder="e.g. 60" value={form.target_weight_kg} onChange={set('target_weight_kg')} />
        </Field>
      </div>
      <Field label="Activity level">
        <select style={tab.input} value={form.activity_level} onChange={set('activity_level')}>
          {Object.entries(ACTIVITY_LABELS).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
      </Field>

      {(proteinTarget || fiberTarget || tdee) && (
        <div style={tab.computedBox}>
          <p style={tab.computedTitle}>Auto-computed from your profile</p>
          {tdee          && <ComputedRow color="#3B82F6" label="TDEE"    value={`${tdee} kcal/day`}      note="maintenance calories" />}
          {proteinTarget && <ComputedRow color="#6366F1" label="Protein" value={`${proteinTarget}g/day`} note={`1.6g × ${parseFloat(form.weight_kg)}kg`} />}
          {fiberTarget   && <ComputedRow color="#22C55E" label="Fiber"   value={`${fiberTarget}g/day`}   note="based on gender & age" />}
        </div>
      )}
    </div>
  );
}

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
    <div style={tab.container}>
      <SectionLabel>Goal pace</SectionLabel>
      <p style={tab.hint}>How fast do you want to reach your goal weight?</p>

      <div style={tab.paceGrid}>
        {Object.entries(GOAL_PACE_META).map(([pace, meta]) => {
          const selected = form.goal_pace === pace;
          return (
            <button
              key={pace}
              type="button"
              onClick={() => set('goal_pace')({ target: { value: pace } })}
              style={{
                ...tab.paceCard,
                borderColor:  selected ? meta.color : '#EBEBEB',
                background:   selected ? meta.color + '12' : '#fff',
              }}
            >
              <span style={{ ...tab.paceName, color: selected ? meta.color : '#1A1A1A' }}>
                {meta.label}
              </span>
              {meta.rate && <span style={tab.paceRate}>{meta.rate}</span>}
              <span style={tab.paceDesc}>{meta.desc}</span>
            </button>
          );
        })}
      </div>

      <SectionLabel>Calorie target</SectionLabel>
      <Field label={
        <span>Manual override <span style={{ color: '#B0B0B0', fontWeight: 400 }}>— leave blank for auto</span></span>
      }>
        <input style={tab.input} type="number" min="500" max="10000"
          placeholder={adjustedTarget ? `Auto: ${adjustedTarget} kcal` : 'e.g. 1800'}
          value={form.daily_calorie_target}
          onChange={set('daily_calorie_target')} />
      </Field>

      {(tdee || adjustedTarget) && (
        <div style={tab.summaryBox}>
          <p style={tab.computedTitle}>Your plan</p>
          {tdee && <ComputedRow color="#717171" label="TDEE" value={`${tdee} kcal`} note="maintenance" />}
          {adjustedTarget && form.goal_pace && form.goal_pace !== 'maintain' && (
            <>
              <ComputedRow
                color={GOAL_PACE_META[form.goal_pace]?.color || '#3B82F6'}
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
                  color="#F59E0B"
                  label="Timeline"
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

function SectionLabel({ children }) {
  return <p style={tab.sectionLabel}>{children}</p>;
}

function Field({ label, children }) {
  return (
    <div style={tab.field}>
      <label style={tab.label}>{label}</label>
      {children}
    </div>
  );
}

function ComputedRow({ color, label, value, note }) {
  return (
    <div style={tab.computedRow}>
      <span style={{ ...tab.computedDot, background: color }} />
      <span style={tab.computedLabel}>{label}</span>
      <span style={tab.computedValue}>{value}</span>
      {note && <span style={tab.computedNote}>{note}</span>}
    </div>
  );
}

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
        gender:         form.gender           || undefined,
        age:            form.age              ? parseInt(form.age)              : undefined,
        weight_kg:      form.weight_kg        ? parseFloat(form.weight_kg)      : undefined,
        height_cm:      form.height_cm        ? parseFloat(form.height_cm)      : undefined,
        activity_level: form.activity_level,
        goal_pace:      form.goal_pace,
        daily_calorie_target: form.daily_calorie_target ? parseInt(form.daily_calorie_target) : undefined,
        target_weight_kg:     form.target_weight_kg     ? parseFloat(form.target_weight_kg)   : undefined,
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
      <div style={panel.backdrop} onClick={onClose} />
      <div style={panel.drawer}>
        <div style={panel.header}>
          <h2 style={panel.title}>Settings</h2>
          <button style={panel.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={panel.tabBar}>
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              style={{ ...panel.tab, ...(activeTab === t ? panel.tabActive : {}) }}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} style={panel.formWrap}>
          {activeTab === 'Profile' && <ProfileTab form={form} set={set} />}
          {activeTab === 'Goals'   && <GoalsTab   form={form} set={set} />}

          {error && (
            <div style={panel.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" disabled={saving} style={panel.saveBtn} className="btn-hover">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </>
  );
}

const panel = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, backdropFilter: 'blur(2px)' },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
    background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column',
    boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '22px 24px 18px', borderBottom: '1px solid #EBEBEB', flexShrink: 0,
  },
  title:    { margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' },
  closeBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#B0B0B0', padding: 6, lineHeight: 1, borderRadius: 8 },
  tabBar: {
    display: 'flex', padding: '0 24px', gap: 0,
    borderBottom: '1px solid #EBEBEB', flexShrink: 0,
  },
  tab: {
    padding: '12px 16px', background: 'none', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer',
    fontSize: 14, fontWeight: 500, color: '#717171', marginBottom: -1, transition: 'all 0.15s',
  },
  tabActive: { color: '#1A1A1A', borderBottomColor: '#1A1A1A', fontWeight: 700 },
  formWrap: { flex: 1, overflowY: 'auto', padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10,
    padding: '10px 14px', color: '#DC2626', fontSize: 13, fontWeight: 500,
  },
  saveBtn: {
    padding: '14px', borderRadius: 10, background: '#1A1A1A',
    color: '#fff', border: 'none', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s',
  },
};

const tab = {
  container: { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionLabel: { margin: '6px 0 0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B0B0B0' },
  hint: { margin: 0, fontSize: 12, color: '#B0B0B0' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#1A1A1A' },
  input: {
    padding: '10px 13px', borderRadius: 10, border: '1.5px solid #EBEBEB',
    fontSize: 14, color: '#1A1A1A', outline: 'none', width: '100%',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  computedBox: {
    background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 12,
    padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
  },
  summaryBox: {
    background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12,
    padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
  },
  computedTitle: { margin: '0 0 2px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#B0B0B0' },
  computedRow:   { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  computedDot:   { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  computedLabel: { fontSize: 12, color: '#717171', minWidth: 52 },
  computedValue: { fontSize: 13, fontWeight: 700, color: '#1A1A1A' },
  computedNote:  { fontSize: 11, color: '#B0B0B0' },
  paceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  paceCard: {
    display: 'flex', flexDirection: 'column', gap: 3,
    padding: '12px 14px', borderRadius: 12, border: '2px solid',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
  },
  paceName: { fontSize: 14, fontWeight: 700 },
  paceRate: { fontSize: 12, fontWeight: 600, color: '#717171' },
  paceDesc: { fontSize: 11, color: '#B0B0B0', marginTop: 2 },
};
