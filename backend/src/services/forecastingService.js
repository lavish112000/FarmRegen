const logger = require('../utils/logger');

/**
 * Service to predict future soil health scores based on historical data.
 * Uses Simple Linear Regression (Least Squares Method).
 */

/**
 * Predict future soil health score.
 * @param {Array} history - Array of { analysis_date, soil_health_score }
 * @param {number} daysToPredict - Number of days into the future to predict (default 30)
 * @returns {Object} - { predictedDate, predictedScore, trend, confidence }
 */
const predictSoilHealth = (history, daysToPredict = 30) => {
    try {
        // Need at least 2 data points for a trend
        if (!history || history.length < 2) {
            return null;
        }

        // 1. Prepare Data: Convert dates to timestamps (X) and scores to numbers (Y)
        // Sort by date ascending
        const sortedHistory = [...history]
            .filter(h => h.analysis_date && h.soil_health_score !== null)
            .sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));

        if (sortedHistory.length < 2) return null;

        const data = sortedHistory.map(h => ({
            x: new Date(h.analysis_date).getTime() / (1000 * 60 * 60 * 24), // Convert to Days
            y: parseFloat(h.soil_health_score)
        }));

        // 2. Linear Regression (y = mx + b)
        // m = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)
        // b = (Σy - m*Σx) / n

        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        data.forEach(p => {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // 3. Prediction
        const lastDate = sortedHistory[sortedHistory.length - 1].analysis_date;
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + daysToPredict);

        const futureX = futureDate.getTime() / (1000 * 60 * 60 * 24);
        let predictedScore = slope * futureX + intercept;

        // Clamp score between 0 and 100
        predictedScore = Math.max(0, Math.min(100, Math.round(predictedScore)));

        // 4. Determine Trend
        let trend = 'stable';
        if (slope > 0.05) trend = 'improving'; // Arbitrary threshold for slope sensitivity
        if (slope < -0.05) trend = 'declining';

        // 5. Confidence (Simplified: More data points = higher confidence)
        const confidence = Math.min(0.9, 0.5 + (Math.min(n, 10) * 0.04));

        return {
            predictedDate: futureDate.toISOString(),
            predictedScore,
            trend,
            slope: slope.toFixed(4),
            confidence: confidence.toFixed(2)
        };

    } catch (error) {
        logger.error('Forecasting error', { error: error.message });
        return null;
    }
};

module.exports = {
    predictSoilHealth
};
