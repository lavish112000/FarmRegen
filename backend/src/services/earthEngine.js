const ee = require('@google/earthengine');
const privateKey = require('../../service-account.json');

// Initialize Earth Engine
const initialize = () => {
    return new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(privateKey, () => {
            ee.initialize(null, null, () => {
                console.log('Google Earth Engine initialized successfully');
                resolve();
            }, (err) => {
                console.error('GEE Initialization error DETAILS:', err);
                reject(err);
            });
        }, (err) => {
            console.error('GEE Authentication error:', err);
            reject(err);
        });
    });
};

// Calculate NDVI for a given geometry
// Helper function to calculate mean NDVI and generate an image URL
const getAnalysis = async (geoJSON) => {
    // Convert GeoJSON to EE Geometry
    const geometry = ee.Geometry(geoJSON);

    // Date range: Last 60 days to ensure we find a cloud-free image
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 60);

    // Sentinel-2 collection (Harmonized)
    const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(geometry)
        .filterDate(startDate, endDate)
        // Filter for images with less than 20% cloud cover
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        .sort('CLOUDY_PIXEL_PERCENTAGE', true); // Get least cloudy first

    // Check if we found any images
    const count = await new Promise((resolve, reject) => {
        s2.size().evaluate((val, err) => {
            if (err) reject(err);
            else resolve(val);
        });
    });

    if (count === 0) {
        throw new Error('No clear satellite imagery found for this location in the last 60 days.');
    }

    // Get the best image
    const image = s2.first();

    // Calculate NDVI: (NIR - RED) / (NIR + RED)
    // Sentinel-2 Bands: B8 (NIR), B4 (Red)
    const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

    // Calculate mean AND standard deviation for the region
    const statsDict = await new Promise((resolve, reject) => {
        ndvi.reduceRegion({
            reducer: ee.Reducer.mean().combine({
                reducer2: ee.Reducer.stdDev(),
                sharedInputs: true
            }),
            geometry: geometry,
            scale: 10, // 10m resolution
            maxPixels: 1e9
        }).evaluate((val, err) => {
            if (err) reject(err);
            else resolve(val);
        });
    });

    const meanNDVI = statsDict.NDVI_mean;
    const stdDevNDVI = statsDict.NDVI_stdDev;

    // --- SCORING ALGORITHM ---
    // 1. Base Score: NDVI * 100 (0 to 100)
    // 2. Uniformity Penalty: High standard deviation means patchy growth.
    //    We subtract (StdDev * 50). 
    //    Example: Mean 0.7 (70), StdDev 0.1 (10). Score = 70 - 5 = 65.
    let score = (meanNDVI * 100) - (stdDevNDVI * 50);

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Grading
    let grade = 'Critical';
    if (score >= 80) grade = 'Excellent';
    else if (score >= 60) grade = 'Good';
    else if (score >= 40) grade = 'Moderate';

    // Get a thumbnail/visualization URL
    const vizParams = {
        min: 0,
        max: 0.8,
        palette: ['red', 'yellow', 'green'] // Red (Low health) -> Green (High health)
    };

    // We clip the image to the geometry for the visualization
    const visImage = ndvi.visualize(vizParams).clip(geometry);

    const mapUrl = await new Promise((resolve, reject) => {
        visImage.getThumbURL({
            dimensions: 500,
            region: geometry,
            format: 'png'
        }, (url, err) => {
            if (err) reject(err);
            else resolve(url);
        });
    });

    // Get the date of the image
    const date = await new Promise((resolve, reject) => {
        image.date().format('yyyy-MM-dd').evaluate((val, err) => {
            if (err) reject(err);
            else resolve(val);
        })
    });

    return {
        ndvi: meanNDVI,
        std_dev: stdDevNDVI,
        score: score,
        grade: grade,
        image_url: mapUrl,
        date: date
    };
};

module.exports = {
    initialize,
    getAnalysis
};
