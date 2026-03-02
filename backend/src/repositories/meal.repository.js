const { BaseRepository } = require('./base.repository');
const { MEAL_QUERIES } = require('./queries');

class MealRepository extends BaseRepository {
  /**
   * Fetch all meals for a user on a given date.
   * @param {string} userId - UUID
   * @param {string} date - ISO date string (YYYY-MM-DD)
   * @returns {Promise<Object[]>}
   */
  async findByUserAndDate(userId, date) {
    const result = await this._query(MEAL_QUERIES.FIND_BY_USER_AND_DATE, [userId, date]);
    return result.rows;
  }

  /**
   * Aggregate daily calorie totals for the last N days.
   * @param {string} userId - UUID
   * @param {number} days - Number of days to look back (max 365)
   * @returns {Promise<Object[]>} Rows with date, total_calories, meals[]
   */
  async findDailySummary(userId, days) {
    const result = await this._query(MEAL_QUERIES.FIND_DAILY_SUMMARY, [userId, days]);
    return result.rows;
  }

  /**
   * Insert a new meal record.
   * @param {Object} data
   * @param {string} data.userId
   * @param {string} data.date
   * @param {string} data.mealType
   * @param {string} data.transcript
   * @param {Object[]} data.foods
   * @param {number} data.total_calories
   * @returns {Promise<Object>} Created meal row
   */
  async create(data) {
    const { userId, date, mealType, transcript, foods, total_calories, protein_g = 0, fiber_g = 0, carbs_g = 0, fat_g = 0 } = data;
    const result = await this._query(
      MEAL_QUERIES.CREATE,
      [userId, date, mealType, transcript, JSON.stringify(foods), total_calories, protein_g, fiber_g, carbs_g, fat_g],
    );
    return result.rows[0];
  }

  /**
   * Update a meal using COALESCE to preserve existing values for omitted fields.
   * @param {string} id - UUID
   * @param {Object} fields - Partial meal fields { meal_type, foods, total_calories, date }
   * @returns {Promise<Object|null>} Updated meal row, or null if not found
   */
  async update(id, fields) {
    const { meal_type, foods, total_calories, date, protein_g, fiber_g, carbs_g, fat_g } = fields;
    const result = await this._query(
      MEAL_QUERIES.UPDATE,
      [meal_type, foods ? JSON.stringify(foods) : null, total_calories, date, protein_g, fiber_g, carbs_g, fat_g, id],
    );
    return result.rows[0] || null;
  }

  /**
   * Delete a meal by id.
   * @param {string} id - UUID
   * @returns {Promise<string|null>} Deleted id, or null if not found
   */
  async deleteById(id) {
    const result = await this._query(MEAL_QUERIES.DELETE_BY_ID, [id]);
    return result.rows[0]?.id || null;
  }
}

module.exports = { MealRepository };
