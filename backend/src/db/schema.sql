-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(100) NOT NULL,
  age                   INTEGER,
  weight_kg             DECIMAL(5,2),
  height_cm             DECIMAL(5,2),
  gender                VARCHAR(10),
  -- sedentary | light | moderate | active | very_active
  activity_level        VARCHAR(20) DEFAULT 'moderate',
  target_weight_kg      DECIMAL(5,2),
  target_date           DATE,
  daily_calorie_target  INTEGER,
  -- maintain | slow | moderate | aggressive
  goal_pace             VARCHAR(20) DEFAULT 'maintain',
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender    VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS goal_pace VARCHAR(20) DEFAULT 'maintain';

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type         VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  audio_transcript  TEXT,
  -- JSONB: [{ "name": "...", "calories": 180, "protein_g": 12, "fiber_g": 2, "carbs_g": 20, "fat_g": 8 }]
  foods             JSONB NOT NULL DEFAULT '[]',
  total_calories    INTEGER NOT NULL DEFAULT 0,
  protein_g         DECIMAL(7,2) NOT NULL DEFAULT 0,
  fiber_g           DECIMAL(7,2) NOT NULL DEFAULT 0,
  carbs_g           DECIMAL(7,2) NOT NULL DEFAULT 0,
  fat_g             DECIMAL(7,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
ALTER TABLE meals ADD COLUMN IF NOT EXISTS protein_g DECIMAL(7,2) NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS fiber_g   DECIMAL(7,2) NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS carbs_g   DECIMAL(7,2) NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS fat_g     DECIMAL(7,2) NOT NULL DEFAULT 0;

-- Primary query pattern: get all meals for a user on a specific date
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
-- Secondary: aggregate queries across all users by date (admin/analytics)
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
-- Future: query meals by food item content
CREATE INDEX IF NOT EXISTS idx_meals_foods ON meals USING gin(foods);
