const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const earthEngineService = require('../services/earthEngine');
const fieldModel = require('../models/fieldModel');
const db = require('../config/db');

// POST /api/analysis/:fieldId
router.post('/:fieldId', verifyToken, async (req, res) => {
    try {
        const { fieldId } = req.params;
        const userId = req.user.id;

        // 1. Get the field to ensure it belongs to the user
        // We reuse the fieldModel logic or query directly
        // Ideally fieldModel.getById(fieldId) would refer to user, but let's just query
        const fieldResult = await db.query(
            'SELECT id, name, ST_AsGeoJSON(boundary) as boundary FROM fields WHERE id = $1 AND user_id = $2',
            [fieldId, userId]
        );

        if (fieldResult.rows.length === 0) {
            return res.status(404).json({ message: 'Field not found' });
        }

        const field = fieldResult.rows[0];
        const geojson = JSON.parse(field.boundary);

        // 2. Call Earth Engine Service
        console.log(`Starting analysis for field: ${field.name}`);
        const analysisResult = await earthEngineService.getAnalysis(geojson);

        // 3. Save the result to the database
        // We need a 'field_analyses' table insert here
        console.log('Inserting into field_analyses...');
        const savedAnalysis = await db.query(
            `INSERT INTO field_analyses (field_id, analysis_date, ndvi_mean, soil_score, satellite_image_url)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                fieldId,
                analysisResult.date,
                analysisResult.ndvi,
                analysisResult.score, // Use the smart score (includes penalties)
                analysisResult.image_url
            ]
        );
        console.log('Insert successful, ID:', savedAnalysis.rows[0].id);

        // Update the field's last analysis summary
        console.log('Updating fields table...');
        await db.query(
            'UPDATE fields SET soil_health_score = $1, last_analysis_date = $2 WHERE id = $3',
            [analysisResult.score, analysisResult.date, fieldId]
        );
        console.log('Field updated.');

        console.log('Sending response...');
        res.json(savedAnalysis.rows[0]);
        console.log('Response sent.');

    } catch (error) {
        console.error('Analysis failed FULL ERROR:', error);
        res.status(500).json({ message: error.message || 'Analysis failed', details: error.toString() });
    }
});

// GET /api/analysis/history
router.get('/history', verifyToken, async (req, res) => {
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
        console.error('Failed to fetch history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
