const db = require('../config/db');
const earthEngineService = require('../services/earthEngine');
const forecastingService = require('../services/forecastingService');
const logger = require('../utils/logger');

/**
 * Run analysis on a specific field
 * 1. Validates ownership
 * 2. Fetches GeoJSON
 * 3. Calls Earth Machine Learning Engine
 * 4. Saves results
 * 5. Generates AI prediction based on history
 */
const analyzeField = async (req, res) => {
    try {
        const { fieldId } = req.params;
        const userId = req.user.id;

        // 1. Get the field to ensure it belongs to the user
        const fieldResult = await db.query(
            'SELECT id, name, ST_AsGeoJSON(boundary) as boundary FROM fields WHERE id = $1 AND user_id = $2',
            [fieldId, userId]
        );

        if (fieldResult.rows.length === 0) {
            return res.status(404).json({ message: 'Field not found' });
        }

        const field = fieldResult.rows[0];
        const geojson = JSON.parse(field.boundary);

        // 2. Call Earth Engine Service (Remote Sensing AI)
        logger.info(`Starting analysis for field: ${field.name}`, { fieldId, userId });
        const analysisResult = await earthEngineService.getAnalysis(geojson);

        // 3. Save the result to the database
        const savedAnalysis = await db.query(
            `INSERT INTO field_analyses (
                field_id, analysis_date, ndvi_mean, ndvi_std_dev, 
                ndmi_mean, evi_mean, savi_mean,
                soil_score, moisture_status, satellite_image_url, indices_data
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                fieldId,
                analysisResult.date,
                analysisResult.ndvi,
                analysisResult.std_dev,
                analysisResult.indices?.ndmi?.mean || null,
                analysisResult.indices?.evi?.mean || null,
                analysisResult.indices?.savi?.mean || null,
                analysisResult.score,
                analysisResult.indices?.ndmi?.status || null,
                analysisResult.image_url,
                JSON.stringify(analysisResult.indices)
            ]
        );
        logger.info('Analysis saved successfully', { analysisId: savedAnalysis.rows[0].id, fieldId });

        // Update the field's last analysis summary
        await db.query(
            'UPDATE fields SET soil_health_score = $1, last_analysis_date = $2 WHERE id = $3',
            [analysisResult.score, analysisResult.date, fieldId]
        );

        // 4. Generate AI Forecast (Predictive AI)
        // Fetch history for this field including the new one
        const historyResult = await db.query(
            'SELECT analysis_date, soil_score as soil_health_score FROM field_analyses WHERE field_id = $1 ORDER BY analysis_date ASC',
            [fieldId]
        );

        const prediction = forecastingService.predictSoilHealth(historyResult.rows);

        // Return the full analysis result including indices and prediction
        res.json({
            ...savedAnalysis.rows[0],
            indices: analysisResult.indices,
            grade: analysisResult.grade,
            prediction // New AI feature
        });

    } catch (error) {
        logger.error('Analysis failed', { error: error.message, stack: error.stack });
        res.status(500).json({ message: error.message || 'Analysis failed', details: error.toString() });
    }
};

/**
 * Get analysis history for a field
 */
const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT fa.*, f.name as field_name 
             FROM field_analyses fa
             JOIN fields f ON fa.field_id = f.id
             WHERE f.user_id = $1
             ORDER BY fa.analysis_date DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        logger.error('Failed to fetch history', { error: error.message });
        res.status(500).json({ message: 'Server error fetching history' });
    }
};

module.exports = {
    analyzeField,
    getHistory
};
