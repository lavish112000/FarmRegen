const db = require('../config/db');

const Field = {
    /**
     * Create a new field with auto-calculated hectares using PostGIS
     */
    async create({ user_id, name, geojson, hectares, address }) {
        // ST_Area with geography cast gives area in square meters
        // Divide by 10000 to convert to hectares
        // If hectares is provided and > 0, use it; otherwise auto-calculate
        const query = `
      INSERT INTO fields (user_id, name, boundary, hectares, address)
      VALUES (
        $1, 
        $2, 
        ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), 
        CASE 
          WHEN $4 > 0 THEN $4 
          ELSE ROUND(CAST(ST_Area(ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)::geography) / 10000 AS NUMERIC), 2)
        END,
        $5
      )
      RETURNING id, name, hectares, address, created_at, ST_AsGeoJSON(boundary) as boundary
    `;
        // Ensure geojson is stringified
        const values = [user_id, name, JSON.stringify(geojson), hectares || 0, address];
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
    },

    /**
     * Update a field (name and/or address)
     */
    async update(id, user_id, { name, address }) {
        const query = `
      UPDATE fields 
      SET name = COALESCE($1, name), 
          address = COALESCE($2, address),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING id, name, hectares, address, created_at, updated_at, last_analysis_date, soil_health_score, ST_AsGeoJSON(boundary) as boundary
    `;
        const { rows } = await db.query(query, [name, address, id, user_id]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            boundary: JSON.parse(rows[0].boundary)
        };
    },

    /**
     * Get a single field by ID
     */
    async findById(id, user_id) {
        const query = `
      SELECT id, name, hectares, address, created_at, last_analysis_date, soil_health_score, ST_AsGeoJSON(boundary) as boundary
      FROM fields
      WHERE id = $1 AND user_id = $2
    `;
        const { rows } = await db.query(query, [id, user_id]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            boundary: JSON.parse(rows[0].boundary)
        };
    }
};

module.exports = Field;
