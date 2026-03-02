import { useState, useEffect, useCallback } from 'react';
import MealCard from '../components/MealCard';
import MiscSnackSection from '../components/MiscSnackSection';
import DailySummary from '../components/DailySummary';
import CalorieChart from '../components/CalorieChart';
import MacroChart from '../components/MacroChart';
import MacroInsight from '../components/MacroInsight';
import { getMeals, getMealsSummary, createUser } from '../api/client';
import { computeTargets } from '../utils/targets';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const today = () => new Date().toISOString().split('T')[0];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard({ user, onUserUpdate }) {
  const [showProfileForm, setShowProfileForm] = useState(!user);
  const [meals, setMeals]             = useState([]);
  const [miscMeals, setMiscMeals]     = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [date]                        = useState(today());
  const [loading, setLoading]         = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', weight_kg: '', height_cm: '', age: '', gender: '',
  });

  const targets = user ? computeTargets(user) : {};

  const loadMeals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMeals(user.id, date);
      const all = data.meals || [];
      setMeals(all.filter((m) => m.meal_type !== 'misc'));
      setMiscMeals(all.filter((m) => m.meal_type === 'misc'));
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    const data = await getMealsSummary(user.id, 7);
    setSummaryData(data.summary || []);
  }, [user]);

  useEffect(() => { loadMeals(); loadSummary(); }, [loadMeals, loadSummary]);

  async function handleCreateProfile(e) {
    e.preventDefault();
    const newUser = await createUser({
      name:      profileForm.name,
      weight_kg: profileForm.weight_kg ? parseFloat(profileForm.weight_kg) : undefined,
      height_cm: profileForm.height_cm ? parseFloat(profileForm.height_cm) : undefined,
      age:       profileForm.age       ? parseInt(profileForm.age)          : undefined,
      gender:    profileForm.gender    || undefined,
    });
    onUserUpdate(newUser);
    setShowProfileForm(false);
  }

  function handleMealRecorded(newMeal) {
    setMeals((prev) => {
      const filtered = prev.filter((m) => m.meal_type !== newMeal.meal_type);
      return [...filtered, newMeal];
    });
    loadSummary();
  }

  function handleMealDeleted(mealId) {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
    loadSummary();
  }

  function handleMiscAdded(newMeal) {
    setMiscMeals((prev) => [...prev, newMeal]);
    loadSummary();
  }

  function handleMiscDeleted(mealId) {
    setMiscMeals((prev) => prev.filter((m) => m.id !== mealId));
    loadSummary();
  }

  const allMeals = [...meals, ...miscMeals];
  const totalCalories = allMeals.reduce((s, m) => s + m.total_calories, 0);
  const macroTotals = allMeals.reduce(
    (s, m) => ({
      protein_g: +(s.protein_g + parseFloat(m.protein_g || 0)).toFixed(1),
      fiber_g:   +(s.fiber_g   + parseFloat(m.fiber_g   || 0)).toFixed(1),
      carbs_g:   +(s.carbs_g   + parseFloat(m.carbs_g   || 0)).toFixed(1),
      fat_g:     +(s.fat_g     + parseFloat(m.fat_g     || 0)).toFixed(1),
    }),
    { protein_g: 0, fiber_g: 0, carbs_g: 0, fat_g: 0 },
  );


  if (showProfileForm) {
    return (
      <div style={styles.page}>
        <div style={styles.setupCard}>
          <div style={styles.setupIcon}>👋</div>
          <h2 style={styles.setupTitle}>Welcome to CalTrack</h2>
          <p style={styles.setupSub}>Tell us a bit about yourself to get personalized targets.</p>
          <form onSubmit={handleCreateProfile} style={styles.form}>
            <Field label="Name *">
              <input required style={styles.input} placeholder="Your name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
            </Field>
            <Field label="Gender">
              <select style={styles.input} value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}>
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <div style={styles.row2}>
              <Field label="Age">
                <input style={styles.input} type="number" placeholder="e.g. 28"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} />
              </Field>
              <Field label="Weight (kg)">
                <input style={styles.input} type="number" step="0.1" placeholder="e.g. 72"
                  value={profileForm.weight_kg}
                  onChange={(e) => setProfileForm({ ...profileForm, weight_kg: e.target.value })} />
              </Field>
            </div>
            <Field label="Height (cm)">
              <input style={styles.input} type="number" step="0.1" placeholder="e.g. 175"
                value={profileForm.height_cm}
                onChange={(e) => setProfileForm({ ...profileForm, height_cm: e.target.value })} />
            </Field>
            <button type="submit" style={styles.submitBtn} className="btn-hover">Get started →</button>
          </form>
        </div>
      </div>
    );
  }

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>{greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p style={styles.sub}>{dateLabel}</p>
        </div>
      </header>

      <DailySummary
        totalCalories={totalCalories}
        targetCalories={targets.calories}
        date={date}
        totals={macroTotals}
        targets={targets}
      />

      <MacroInsight totals={macroTotals} targets={targets} />

      <section>
        <h2 style={styles.sectionTitle}>Today's meals</h2>
        {loading ? (
          <div style={styles.loadingWrap}>
            <span style={styles.loadingSpinner} />
          </div>
        ) : (
          <div style={styles.mealGrid}>
            {MEAL_TYPES.map((type) => (
              <MealCard
                key={type}
                mealType={type}
                meal={meals.find((m) => m.meal_type === type)}
                userId={user.id}
                date={date}
                onMealRecorded={handleMealRecorded}
                onMealDeleted={handleMealDeleted}
              />
            ))}
          </div>
        )}
      </section>

      <MiscSnackSection
        userId={user.id}
        date={date}
        miscMeals={miscMeals}
        onAdded={handleMiscAdded}
        onDeleted={handleMiscDeleted}
      />

      <section>
        <h2 style={styles.sectionTitle}>Last 7 days</h2>
        <div style={styles.chartStack}>
          <CalorieChart data={summaryData} targetCalories={targets.calories} />
          <MacroChart data={summaryData} targets={targets} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 24px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  h1: { margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', color: '#1A1A1A' },
  sub: { margin: '4px 0 0', color: '#717171', fontSize: 14 },
  sectionTitle: { margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.2px' },
  mealGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  chartStack: { display: 'flex', flexDirection: 'column', gap: 16 },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: 40 },
  loadingSpinner: {
    width: 32, height: 32,
    border: '3px solid #EBEBEB', borderTopColor: '#1A1A1A',
    borderRadius: '50%', display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  setupCard: {
    maxWidth: 440,
    margin: '60px auto',
    background: '#fff',
    borderRadius: 20,
    padding: '40px 36px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    border: '1px solid #EBEBEB',
  },
  setupIcon: { fontSize: 40, marginBottom: 16 },
  setupTitle: { margin: '0 0 8px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' },
  setupSub: { margin: '0 0 28px', color: '#717171', fontSize: 14, lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: {
    padding: '11px 14px', borderRadius: 10, border: '1.5px solid #EBEBEB',
    fontSize: 14, color: '#1A1A1A', background: '#fff', transition: 'border-color 0.15s',
    width: '100%',
  },
  submitBtn: {
    marginTop: 6, padding: '14px', borderRadius: 10,
    background: '#1A1A1A', color: '#fff', border: 'none',
    fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'opacity 0.15s',
  },
};
