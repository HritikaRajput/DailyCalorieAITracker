const ACTIVITY_MULTIPLIERS = {
  sedentary:  1.2,
  light:      1.375,
  moderate:   1.55,
  active:     1.725,
  very_active: 1.9,
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
  return a < 19 ? 20 : 25; // other / unknown
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

/** Returns all targets for a user. Calorie target uses manual override if set. */
export function computeTargets(user) {
  return {
    calories:  user.daily_calorie_target || computeTDEE(user),
    protein_g: computeProteinTarget(user.weight_kg),
    fiber_g:   computeFiberTarget(user.gender, user.age),
  };
}
