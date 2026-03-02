class BaseRepository {
  /**
   * @param {Function} query - pg-pool query function bound to the pool
   */
  constructor(query) {
    this._query = query;
  }

  /**
   * Build a dynamic SET clause for UPDATE statements.
   * @param {Object} fields - Key/value pairs of columns to update
   * @returns {{ setClauses: string, values: any[] }}
   */
  buildUpdateSetClause(fields) {
    const keys = Object.keys(fields);
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map((k) => fields[k]);
    return { setClauses, values };
  }
}

module.exports = { BaseRepository };
