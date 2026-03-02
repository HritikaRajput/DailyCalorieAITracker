const USER_QUERIES = {
  FIND_BY_ID: 'SELECT * FROM users WHERE id = $1',
  FIND_ALL: 'SELECT * FROM users ORDER BY created_at DESC',
  CREATE:
    `INSERT INTO users (name, age, weight_kg, height_cm, gender, activity_level, target_weight_kg, target_date, daily_calorie_target)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
  // UPDATE is built dynamically — see UserRepository.update()
};

const MEAL_QUERIES = {
  FIND_BY_USER_AND_DATE:
    'SELECT * FROM meals WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC',
  FIND_DAILY_SUMMARY:
    `SELECT
       date::text,
       SUM(total_calories)::int          AS total_calories,
       ROUND(SUM(protein_g)::numeric, 1) AS total_protein_g,
       ROUND(SUM(fiber_g)::numeric, 1)   AS total_fiber_g,
       ROUND(SUM(carbs_g)::numeric, 1)   AS total_carbs_g,
       ROUND(SUM(fat_g)::numeric, 1)     AS total_fat_g,
       json_agg(json_build_object(
         'id', id,
         'meal_type', meal_type,
         'total_calories', total_calories
       ) ORDER BY created_at) AS meals
     FROM meals
     WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '1 day' * ($2 - 1)
       AND date <= CURRENT_DATE
     GROUP BY date
     ORDER BY date ASC`,
  CREATE:
    `INSERT INTO meals (user_id, date, meal_type, audio_transcript, foods, total_calories, protein_g, fiber_g, carbs_g, fat_g)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
  UPDATE:
    `UPDATE meals SET
       meal_type      = COALESCE($1, meal_type),
       foods          = COALESCE($2, foods),
       total_calories = COALESCE($3, total_calories),
       date           = COALESCE($4, date),
       protein_g      = COALESCE($5, protein_g),
       fiber_g        = COALESCE($6, fiber_g),
       carbs_g        = COALESCE($7, carbs_g),
       fat_g          = COALESCE($8, fat_g),
       updated_at     = NOW()
     WHERE id = $9
     RETURNING *`,
  DELETE_BY_ID: 'DELETE FROM meals WHERE id = $1 RETURNING id',
};

module.exports = { USER_QUERIES, MEAL_QUERIES };
