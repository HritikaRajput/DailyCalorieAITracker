const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

// Daily kcal deficit/surplus per pace
export const GOAL_PACE_ADJUSTMENTS = {
  maintain:   0,
  slow:       250,   // ~0.25 kg/week
  moderate:   500,   // ~0.5  kg/week
  aggressive: 1000,  // ~1    kg/week
};

export const GOAL_PACE_META = {
  maintain:   { label: 'Maintain',   rate: null,   color: '#6b7280', desc: 'Stay at current weight' },
  slow:       { label: 'Slow',       rate: '~0.25 kg/week', color: '#10b981', desc: 'Gentle, sustainable change' },
  moderate:   { label: 'Moderate',   rate: '~0.5 kg/week',  color: '#3b82f6', desc: 'Steady progress' },
  aggressive: { label: 'Aggressive', rate: '~1 kg/week',    color: '#f59e0b', desc: 'Faster results, harder to sustain' },
};

/**
 * Fiber target based on gender + age per dietary guidelines.
 * Men (19–50): 35g, Men (50+): 29g
 * Women (19–50): 25g, Women (50+): 22g
 * Children/other: 20g
 */
export function computeFiberTarget(gender, age) {
  const a = parseInt(age) || 30;
  if (gender === 'male')   return a <= 50 ? 35 : 29;
  if (gender === 'female') return a <= 50 ? 25 : 22;
  return a < 19 ? 20 : 25;
}

/** Protein: 1.6g per kg body weight */
export function computeProteinTarget(weight_kg) {
  if (!weight_kg) return null;
  return Math.round(1.6 * parseFloat(weight_kg));
}

/**
 * TDEE via Harris-Benedict BMR × activity multiplier.
 * Defaults to female formula if gender is unknown.
 */
export function computeTDEE(user) {
  if (!user.weight_kg || !user.height_cm || !user.age) return null;
  const w = parseFloat(user.weight_kg);
  const h = parseFloat(user.height_cm);
  const a = parseInt(user.age);
  const bmr = user.gender === 'male'
    ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
    : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
  const multiplier = ACTIVITY_MULTIPLIERS[user.activity_level] || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Calorie target = TDEE adjusted by goal pace and direction.
 * If user has manually set daily_calorie_target, that always wins.
 */
export function computeCalorieTarget(user) {
  if (user.daily_calorie_target) return parseInt(user.daily_calorie_target);
  const tdee = computeTDEE(user);
  if (!tdee) return null;

  const pace       = user.goal_pace || 'maintain';
  const adjustment = GOAL_PACE_ADJUSTMENTS[pace] || 0;
  if (adjustment === 0) return tdee;

  const current = parseFloat(user.weight_kg);
  const target  = parseFloat(user.target_weight_kg);
  const losing  = target && target < current;
  const gaining = target && target > current;

  if (losing)  return Math.max(1200, tdee - adjustment); // safety floor
  if (gaining) return tdee + adjustment;
  return tdee; // no target set — just maintain
}

/**
 * Estimated weeks to reach goal weight at a given pace.
 * 1 kg ≈ 7700 kcal.
 */
export function computeWeeksToGoal(user) {
  const pace = user.goal_pace;
  if (!pace || pace === 'maintain') return null;
  const adjustment = GOAL_PACE_ADJUSTMENTS[pace];
  if (!adjustment) return null;

  const current = parseFloat(user.weight_kg);
  const target  = parseFloat(user.target_weight_kg);
  if (!current || !target || current === target) return null;

  const kgToGo      = Math.abs(current - target);
  const kgPerWeek   = (adjustment * 7) / 7700;
  return Math.ceil(kgToGo / kgPerWeek);
}

/** Returns all targets for a user. */
export function computeTargets(user) {
  return {
    calories:  computeCalorieTarget(user),
    protein_g: computeProteinTarget(user.weight_kg),
    fiber_g:   computeFiberTarget(user.gender, user.age),
  };
}
