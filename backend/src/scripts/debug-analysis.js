const db = require('../config/db');
const earthEngineService = require('../services/earthEngine');

const runDebug = async () => {
    try {
        console.log('1. Connecting to DB...');
        const result = await db.query('SELECT id, name, ST_AsGeoJSON(boundary) as boundary FROM fields ORDER BY created_at DESC LIMIT 1');

        if (result.rows.length === 0) {
            console.log('No fields found in DB.');
            process.exit(0);
        }

        const field = result.rows[0];
        console.log(`2. Found field: ${field.name} (${field.id})`);

        const geojson = JSON.parse(field.boundary);
        console.log('3. Initializing GEE...');
        await earthEngineService.initialize();

        console.log('4. Running Analysis...');
        const analysisResult = await earthEngineService.getAnalysis(geojson);
        console.log('GEE Result Date:', analysisResult.date);
        console.log('GEE Result Full:', JSON.stringify(analysisResult, null, 2));

        console.log('5. Testing DB Insertion...');
        // Simulate the route handler's insert logic
        // logic from analysisRoutes.js
        const fakeSoilScore = Math.round(analysisResult.ndvi * 100);

        const savedAnalysis = await db.query(
            `INSERT INTO field_analyses (field_id, analysis_date, ndvi_mean, soil_score, satellite_image_url)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                field.id,
                analysisResult.date, // This is the potential failure point if format is wrong
                analysisResult.ndvi,
                fakeSoilScore,
                analysisResult.image_url
            ]
        );
        console.log('DB Insert Success:', savedAnalysis.rows[0].id);

        console.log('6. Testing Update Field...');
        await db.query(
            'UPDATE fields SET soil_health_score = $1, last_analysis_date = $2 WHERE id = $3',
            [fakeSoilScore, analysisResult.date, field.id]
        );
        console.log('Field Update Success.');
        console.log('---------------------------------------------------');
        console.log('FULL SUCCESS: Analysis pipeline is working correctly.');

    } catch (error) {
        console.error('---------------------------------------------------');
        console.error('DEBUG SCRIPT FAILED');
        console.error('Error Message:', error.message);
        console.error('Full Error:', error);
        console.error('---------------------------------------------------');
    } finally {
        process.exit();
    }
};

runDebug();
