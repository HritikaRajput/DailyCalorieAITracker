const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('./whisper');
const { extractCalories } = require('./calorie-extractor');
const logger = require('../middleware/logger');

class MealService {
  /**
   * @param {import('../repositories/meal.repository').MealRepository} mealRepository
   */
  constructor(mealRepository) {
    this._mealRepository = mealRepository;
  }

  /**
   * Full pipeline: audio file → transcript → calorie extraction → DB record.
   * Cleans up the temp file on both success and failure.
   * @param {Express.Multer.File} audioFile - Multer file object
   * @param {Object} opts
   * @param {string} opts.userId
   * @param {string} opts.mealType
   * @param {string} [opts.date] - ISO date string; defaults to today
   * @returns {Promise<{ meal: Object, confidence: string }>}
   * @throws {Error} If transcription, extraction, or DB insert fails
   */
  async recordFromAudio(audioFile, { userId, mealType, date }) {
    const tempFilePath = audioFile.path;
    const ext = path.extname(audioFile.originalname) || '.webm';
    const renamedPath = `${tempFilePath}${ext}`;

    try {
      fs.renameSync(tempFilePath, renamedPath);

      const transcript = await transcribeAudio(renamedPath);
      const { foods, total_calories, total_protein_g, total_fiber_g, total_carbs_g, total_fat_g, confidence } = await extractCalories(transcript);

      const mealDate = date || new Date().toISOString().split('T')[0];
      const meal = await this._mealRepository.create({
        userId,
        date: mealDate,
        mealType,
        transcript,
        foods,
        total_calories,
        protein_g: total_protein_g,
        fiber_g: total_fiber_g,
        carbs_g: total_carbs_g,
        fat_g: total_fat_g,
      });

      logger.info('Meal recorded', { mealId: meal.id, total_calories, confidence });
      return { meal, confidence };
    } finally {
      // Always clean up — even if an error was thrown
      try { fs.unlinkSync(renamedPath); } catch {}
      try { fs.unlinkSync(tempFilePath); } catch {}
    }
  }

  /**
   * Sum calories across a list of food items.
   * @param {Array<{ name: string, calories: number }>} foods
   * @returns {number}
   */
  computeTotal(foods) {
    return foods.reduce((sum, f) => sum + f.calories, 0);
  }
}

module.exports = { MealService };
