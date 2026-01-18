const db = require('../config/db');

const Field = {
    /**
     * Create a new field
     */
    async create({ user_id, name, geojson, hectares, address }) {
        // ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) creates a geometry from GeoJSON with WGS 84 SRID
        const query = `
      INSERT INTO fields (user_id, name, boundary, hectares, address)
      VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4, $5)
      RETURNING id, name, hectares, address, created_at, ST_AsGeoJSON(boundary) as boundary
    `;
        // Ensure geojson is stringified
        const values = [user_id, name, JSON.stringify(geojson), hectares, address];
        const { rows } = await db.query(query, values);

        // Return with parsed boundary
        return {
            ...rows[0],
            boundary: JSON.parse(rows[0].boundary)
        };
    },

    /**
     * Get all fields for a user
     */
    async findByUserId(user_id) {
        const query = `
      SELECT id, name, hectares, address, created_at, last_analysis_date, soil_health_score, ST_AsGeoJSON(boundary) as boundary
      FROM fields
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
        const { rows } = await db.query(query, [user_id]);

        // Parse GeoJSON string back to object for API response
        return rows.map(row => ({
            ...row,
            boundary: JSON.parse(row.boundary)
        }));
    },

    /**
     * Delete a field
     */
    async delete(id, user_id) {
        const query = 'DELETE FROM fields WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, user_id]);
        return rows[0];
    }
};

module.exports = Field;
