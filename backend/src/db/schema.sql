-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
-- Contains all fields needed for current (profile) and future (calorie targets, Point 3) features
CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(100) NOT NULL,
  age                   INTEGER,
  weight_kg             DECIMAL(5,2),
  height_cm             DECIMAL(5,2),
  -- sedentary | light | moderate | active | very_active
  activity_level        VARCHAR(20) DEFAULT 'moderate',
  -- Point 3 fields: stored now, used later for calorie target recommendations
  target_weight_kg      DECIMAL(5,2),
  target_date           DATE,
  daily_calorie_target  INTEGER,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- Meals table
-- Each voice note creates one meal record
CREATE TABLE IF NOT EXISTS meals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  -- breakfast | lunch | dinner | snack
  meal_type         VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  audio_transcript  TEXT,
  -- JSONB: [{ "name": "2 eggs scrambled", "calories": 180 }, ...]
  -- GIN indexed for future food-level queries (e.g. "how often do I eat eggs?")
  foods             JSONB NOT NULL DEFAULT '[]',
  total_calories    INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Primary query pattern: get all meals for a user on a specific date
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
-- Secondary: aggregate queries across all users by date (admin/analytics)
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
-- Future: query meals by food item content
CREATE INDEX IF NOT EXISTS idx_meals_foods ON meals USING gin(foods);
