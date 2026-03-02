import { useState, useEffect, useCallback } from 'react';
import MealCard from '../components/MealCard';
import DailySummary from '../components/DailySummary';
import CalorieChart from '../components/CalorieChart';
import MacroChart from '../components/MacroChart';
import MacroInsight from '../components/MacroInsight';
import ProfilePanel from '../components/ProfilePanel';
import { getMeals, getMealsSummary, createUser } from '../api/client';
import { computeTargets } from '../utils/targets';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const today = () => new Date().toISOString().split('T')[0];

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('calorie_tracker_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showProfileForm, setShowProfileForm] = useState(!user);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [meals, setMeals] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [date] = useState(today());
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', weight_kg: '', height_cm: '', age: '', gender: '',
  });

  const targets = user ? computeTargets(user) : {};

  const loadMeals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMeals(user.id, date);
      setMeals(data.meals || []);
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    const data = await getMealsSummary(user.id, 7);
    setSummaryData(data.summary || []);
  }, [user]);

  useEffect(() => {
    loadMeals();
    loadSummary();
  }, [loadMeals, loadSummary]);

  async function handleCreateProfile(e) {
    e.preventDefault();
    const newUser = await createUser({
      name:       profileForm.name,
      weight_kg:  profileForm.weight_kg  ? parseFloat(profileForm.weight_kg)  : undefined,
      height_cm:  profileForm.height_cm  ? parseFloat(profileForm.height_cm)  : undefined,
      age:        profileForm.age        ? parseInt(profileForm.age)           : undefined,
      gender:     profileForm.gender     || undefined,
    });
    localStorage.setItem('calorie_tracker_user', JSON.stringify(newUser));
    setUser(newUser);
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

  // Aggregate today's macros across all meals
  const totalCalories = meals.reduce((s, m) => s + m.total_calories, 0);
  const macroTotals = meals.reduce(
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
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>👋 Welcome! Set up your profile</h2>
          <form onSubmit={handleCreateProfile} style={styles.form}>
            <label style={styles.label}>Name *</label>
            <input required style={styles.input} placeholder="Your name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />

            <label style={styles.label}>Gender</label>
            <select style={styles.input} value={profileForm.gender}
              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>

            <label style={styles.label}>Age</label>
            <input style={styles.input} type="number" placeholder="e.g. 28"
              value={profileForm.age}
              onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} />

            <label style={styles.label}>Current Weight (kg)</label>
            <input style={styles.input} type="number" step="0.1" placeholder="e.g. 72.5"
              value={profileForm.weight_kg}
              onChange={(e) => setProfileForm({ ...profileForm, weight_kg: e.target.value })} />

            <label style={styles.label}>Height (cm)</label>
            <input style={styles.input} type="number" step="0.1" placeholder="e.g. 175"
              value={profileForm.height_cm}
              onChange={(e) => setProfileForm({ ...profileForm, height_cm: e.target.value })} />

            <button type="submit" style={styles.submitBtn}>Create Profile →</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Calorie Tracker</h1>
          <p style={styles.sub}>
            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button style={styles.userBadge} onClick={() => setShowProfilePanel(true)}>
          👤 {user?.name}
        </button>
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
        <h2 style={styles.sectionTitle}>Today's Meals</h2>
        {loading ? (
          <p style={styles.loading}>Loading…</p>
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

      <section>
        <h2 style={styles.sectionTitle}>Last 7 Days</h2>
        <CalorieChart data={summaryData} targetCalories={targets.calories} />
        <div style={{ marginTop: 16 }}>
          <MacroChart data={summaryData} targets={targets} />
        </div>
      </section>

      {showProfilePanel && (
        <ProfilePanel
          user={user}
          onClose={() => setShowProfilePanel(false)}
          onSaved={(updated) => {
            localStorage.setItem('calorie_tracker_user', JSON.stringify(updated));
            setUser(updated);
            setShowProfilePanel(false);
          }}
        />
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  h1: { margin: 0, fontSize: 28, fontWeight: 800 },
  sub: { margin: '4px 0 0', color: '#6b7280', fontSize: 14 },
  userBadge: { background: '#f3f4f6', borderRadius: 20, padding: '6px 14px', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' },
  sectionTitle: { margin: '0 0 12px', fontSize: 18, fontWeight: 700 },
  mealGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  loading: { color: '#9ca3af', textAlign: 'center' },
  formCard: { maxWidth: 400, margin: '80px auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  formTitle: { margin: '0 0 24px', fontSize: 20, fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, outline: 'none' },
  submitBtn: { marginTop: 8, padding: '12px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' },
};
