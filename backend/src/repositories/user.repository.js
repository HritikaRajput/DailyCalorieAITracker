const { BaseRepository } = require('./base.repository');
const { USER_QUERIES } = require('./queries');

class UserRepository extends BaseRepository {
  /**
   * Find a user by primary key.
   * @param {string} id - UUID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const result = await this._query(USER_QUERIES.FIND_BY_ID, [id]);
    return result.rows[0] || null;
  }

  /**
   * Return all users ordered by creation date descending.
   * @returns {Promise<Object[]>}
   */
  async findByEmail(email) {
    const result = await this._query(USER_QUERIES.FIND_BY_EMAIL, [email]);
    return result.rows[0] || null;
  }

  async findAll() {
    const result = await this._query(USER_QUERIES.FIND_ALL);
    return result.rows;
  }

  /**
   * Insert a new user record.
   * @param {Object} data
   * @param {string} data.name
   * @param {number} [data.age]
   * @param {number} [data.weight_kg]
   * @param {number} [data.height_cm]
   * @param {string} [data.activity_level]
   * @param {number} [data.target_weight_kg]
   * @param {string} [data.target_date]
   * @param {number} [data.daily_calorie_target]
   * @returns {Promise<Object>} Created user row
   */
  async create(data) {
    const {
      name, email, password_hash, age, weight_kg, height_cm, gender,
      activity_level, goal_pace, target_weight_kg, target_date, daily_calorie_target,
    } = data;
    const result = await this._query(
      USER_QUERIES.CREATE,
      [name, email, password_hash, age, weight_kg, height_cm, gender, activity_level, goal_pace, target_weight_kg, target_date, daily_calorie_target],
    );
    return result.rows[0];
  }

  /**
   * Dynamically update any subset of user fields.
   * @param {string} id - UUID
   * @param {Object} fields - Columns to update
   * @returns {Promise<Object|null>} Updated user row, or null if not found
   * @throws {Error} If fields is empty
   */
  async update(id, fields) {
    const { setClauses, values } = this.buildUpdateSetClause(fields);
    const result = await this._query(
      `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id],
    );
    return result.rows[0] || null;
  }
}

module.exports = { UserRepository };
