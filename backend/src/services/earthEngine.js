const ee = require('@google/earthengine');
const axios = require('axios');
const logger = require('../utils/logger');

// Load service account from environment variables OR local file
let privateKey = {};

try {
    if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        // Production: usage of Environment Variables
        privateKey = {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
    } else {
        // Development: Fallback to local key file
        const path = require('path');
        const fs = require('fs');
        const keyPath = path.join(__dirname, '../../service-account.json'); // Adjust path to root

        if (fs.existsSync(keyPath)) {
            const keyFile = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            privateKey = {
                client_email: keyFile.client_email,
                private_key: keyFile.private_key
            };
            logger.info('Loaded GEE credentials from local service-account.json');
        } else {
            logger.warn('GEE Credentials missing: No Env Vars and no service-account.json found.');
        }
    }
} catch (error) {
    logger.error('Error loading GEE credentials', { error: error.message });
}

// Initialize Earth Engine
const initialize = () => {
    return new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(privateKey, () => {
            ee.initialize(null, null, () => {
                logger.info('Google Earth Engine initialized successfully');
                resolve();
            }, (err) => {
                logger.error('GEE Initialization error', { error: err });
                reject(err);
            });
        }, (err) => {
            logger.error('GEE Authentication error', { error: err });
            reject(err);
        });
    });
};

/**
 * Calculate multiple vegetation indices for a given geometry
 * - NDVI: Normalized Difference Vegetation Index (vegetation health)
 * - NDMI: Normalized Difference Moisture Index (water content)
 * - EVI: Enhanced Vegetation Index (improved sensitivity in high biomass)
 * - SAVI: Soil Adjusted Vegetation Index (corrects for soil brightness)
 */
const getAnalysis = async (geoJSON, options = {}) => {
    const { indices = ['ndvi', 'ndmi', 'evi', 'savi'] } = options;

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

    // Sentinel-2 Bands:
    // B2: Blue, B3: Green, B4: Red, B8: NIR, B11: SWIR1, B12: SWIR2

    // Calculate NDVI: (NIR - RED) / (NIR + RED)
    const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

    // Calculate NDMI: (NIR - SWIR1) / (NIR + SWIR1) - Moisture content
    const ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI');

    // Calculate EVI: Enhanced Vegetation Index
    // EVI = 2.5 * ((NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1))
    const evi = image.expression(
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        {
            'NIR': image.select('B8').divide(10000),
            'RED': image.select('B4').divide(10000),
            'BLUE': image.select('B2').divide(10000)
        }
    ).rename('EVI');

    // Calculate SAVI: Soil Adjusted Vegetation Index (L = 0.5)
    // SAVI = ((NIR - RED) / (NIR + RED + L)) * (1 + L)
    const L = 0.5;
    const savi = image.expression(
        '((NIR - RED) / (NIR + RED + L)) * (1 + L)',
        {
            'NIR': image.select('B8').divide(10000),
            'RED': image.select('B4').divide(10000),
            'L': L
        }
    ).rename('SAVI');

    // Combine all indices into one image for statistics
    const allIndices = ndvi.addBands(ndmi).addBands(evi).addBands(savi);

    // Calculate statistics for all indices
    const statsDict = await new Promise((resolve, reject) => {
        allIndices.reduceRegion({
            reducer: ee.Reducer.mean().combine({
                reducer2: ee.Reducer.stdDev(),
                sharedInputs: true
            }).combine({
                reducer2: ee.Reducer.minMax(),
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

    const meanNDVI = statsDict.NDVI_mean || 0;
    const stdDevNDVI = statsDict.NDVI_stdDev || 0;
    const meanNDMI = statsDict.NDMI_mean || 0;
    const meanEVI = statsDict.EVI_mean || 0;
    const meanSAVI = statsDict.SAVI_mean || 0;

    // --- SCORING ALGORITHM ---
    // 1. Base Score: NDVI * 100 (0 to 100)
    // 2. Uniformity Penalty: High standard deviation means patchy growth.
    //    We subtract (StdDev * 50). 
    //    Example: Mean 0.7 (70), StdDev 0.1 (10). Score = 70 - 5 = 65.
    let score = (meanNDVI * 100) - (stdDevNDVI * 50);

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Grading based on overall score
    let grade = 'Critical';
    if (score >= 80) grade = 'Excellent';
    else if (score >= 60) grade = 'Good';
    else if (score >= 40) grade = 'Moderate';

    // Moisture status based on NDMI
    let moistureStatus = 'Low';
    if (meanNDMI > 0.2) moistureStatus = 'Adequate';
    else if (meanNDMI > 0.1) moistureStatus = 'Moderate';
    else if (meanNDMI > 0) moistureStatus = 'Low';
    else moistureStatus = 'Stressed';

    // Get a thumbnail/visualization URL (NDVI visualization)
    const vizParams = {
        min: 0,
        max: 0.8,
        palette: ['red', 'yellow', 'green'] // Red (Low health) -> Green (High health)
    };

    // We clip the image to the geometry for the visualization
    const visImage = ndvi.visualize(vizParams).clip(geometry);

    const tempUrl = await new Promise((resolve, reject) => {
        visImage.getThumbURL({
            dimensions: 500,
            region: geometry,
            format: 'png'
        }, (url, err) => {
            if (err) reject(err);
            else resolve(url);
        });
    });

    // Fetch the image content to convert to Base64 (Persistent)
    let finalImageUrl = tempUrl;
    try {
        const imageResponse = await axios.get(tempUrl, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(imageResponse.data, 'binary').toString('base64');
        finalImageUrl = `data:image/png;base64,${base64}`;
        logger.debug('Successfully converted GEE image to Base64');
    } catch (fetchErr) {
        logger.warn('Failed to fetch/convert GEE image, falling back to temp URL', { error: fetchErr.message });
    }

    // Get the date of the image
    const date = await new Promise((resolve, reject) => {
        image.date().format('yyyy-MM-dd').evaluate((val, err) => {
            if (err) reject(err);
            else resolve(val);
        })
    });

    return {
        // Primary NDVI data (backward compatible)
        ndvi: meanNDVI,
        std_dev: stdDevNDVI,
        score: score,
        grade: grade,
        image_url: finalImageUrl,
        date: date,

        // Additional vegetation indices
        indices: {
            ndvi: {
                mean: meanNDVI,
                stdDev: stdDevNDVI,
                min: statsDict.NDVI_min,
                max: statsDict.NDVI_max,
                description: 'Normalized Difference Vegetation Index - measures vegetation health and density'
            },
            ndmi: {
                mean: meanNDMI,
                stdDev: statsDict.NDMI_stdDev,
                min: statsDict.NDMI_min,
                max: statsDict.NDMI_max,
                status: moistureStatus,
                description: 'Normalized Difference Moisture Index - measures vegetation water content'
            },
            evi: {
                mean: meanEVI,
                stdDev: statsDict.EVI_stdDev,
                min: statsDict.EVI_min,
                max: statsDict.EVI_max,
                description: 'Enhanced Vegetation Index - improved sensitivity in high biomass areas'
            },
            savi: {
                mean: meanSAVI,
                stdDev: statsDict.SAVI_stdDev,
                min: statsDict.SAVI_min,
                max: statsDict.SAVI_max,
                description: 'Soil Adjusted Vegetation Index - corrects for soil brightness in sparse vegetation'
            }
        }
    };
};

module.exports = {
    initialize,
    getAnalysis
};
