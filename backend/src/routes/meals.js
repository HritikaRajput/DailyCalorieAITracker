const express = require('express');
const multer = require('multer');
const path = require('path');
const { updateMealSchema, MEAL_TYPES } = require('../models/meal.model');
const { recordLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

// Store uploads in a temp directory, auto-cleaned after processing
const upload = multer({
  dest: path.join(__dirname, '../../tmp/'),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB — Whisper API limit
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'video/webm'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(webm|mp4|mp3|wav|ogg|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio format'));
    }
  },
});

/**
 * @param {import('../services/meal.service').MealService} mealService
 * @param {import('../repositories/meal.repository').MealRepository} mealRepository
 * @returns {express.Router}
 */
function createMealRouter(mealService, mealRepository) {
  const router = express.Router();

  // POST /api/v1/meals/record — upload voice note, get transcript + calorie breakdown
  router.post('/record', recordLimiter, upload.single('audio'), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Audio file is required' });

      const { userId, mealType, date } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      if (!mealType || !MEAL_TYPES.includes(mealType)) {
        return res.status(400).json({ error: `mealType must be one of: ${MEAL_TYPES.join(', ')}` });
      }

      const { meal, confidence } = await mealService.recordFromAudio(req.file, { userId, mealType, date });
      res.status(201).json({ meal, confidence });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/meals?userId=&date= — get meals for a specific day
  router.get('/', async (req, res, next) => {
    try {
      const { userId, date } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const mealDate = date || new Date().toISOString().split('T')[0];
      const meals = await mealRepository.findByUserAndDate(userId, mealDate);
      res.json({ meals, date: mealDate });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/meals/summary?userId=&days=7 — daily calorie totals for graph
  router.get('/summary', async (req, res, next) => {
    try {
      const { userId, days = '7' } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const numDays = Math.min(parseInt(days), 365);
      const summary = await mealRepository.findDailySummary(userId, numDays);
      res.json({ summary, days: numDays });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/v1/meals/:id — manual correction
  router.put('/:id', validate(updateMealSchema), async (req, res, next) => {
    try {
      const { meal_type, foods, total_calories, date } = req.body;

      // Recompute total if foods are updated but total isn't provided
      const computedTotal = (foods && !total_calories)
        ? mealService.computeTotal(foods)
        : total_calories;

      const meal = await mealRepository.update(req.params.id, {
        meal_type, foods, total_calories: computedTotal, date,
      });

      if (!meal) return res.status(404).json({ error: 'Meal not found' });
      res.json({ meal });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/meals/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      const deletedId = await mealRepository.deleteById(req.params.id);
      if (!deletedId) return res.status(404).json({ error: 'Meal not found' });
      res.json({ deleted: deletedId });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createMealRouter };
