const { z } = require('zod');

/** @type {string[]} Valid activity level identifiers */
const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

const GENDERS = ['male', 'female', 'other'];

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(1).max(130).optional(),
  weight_kg: z.number().min(1).max(500).optional(),
  height_cm: z.number().min(50).max(300).optional(),
  gender: z.enum(GENDERS).optional(),
  activity_level: z.enum(ACTIVITY_LEVELS).default('moderate'),
  target_weight_kg: z.number().min(1).max(500).optional(),
  target_date: z.string().optional(),
  daily_calorie_target: z.number().int().min(500).max(10000).optional(),
});

const updateUserSchema = createUserSchema.partial();

module.exports = { ACTIVITY_LEVELS, GENDERS, createUserSchema, updateUserSchema };
