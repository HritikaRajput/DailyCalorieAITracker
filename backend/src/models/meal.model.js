const { z } = require('zod');

/** @type {string[]} Valid meal type identifiers */
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const MealFoodSchema = z.object({
  name: z.string(),
  calories: z.number(),
});

const createMealSchema = z.object({
  userId: z.string().uuid(),
  mealType: z.enum(MEAL_TYPES),
  date: z.string().optional(),
});

const updateMealSchema = z.object({
  meal_type: z.enum(MEAL_TYPES).optional(),
  foods: z.array(MealFoodSchema).optional(),
  total_calories: z.number().int().optional(),
  date: z.string().optional(),
});

module.exports = { MEAL_TYPES, MealFoodSchema, createMealSchema, updateMealSchema };
