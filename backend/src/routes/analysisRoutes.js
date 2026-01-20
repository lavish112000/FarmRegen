const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { analysisLimiter } = require('../middleware/rateLimiter');
const { validateParams } = require('../middleware/validator');
const analysisController = require('../controllers/analysisController');

// POST /api/analysis/:fieldId - Run analysis (with rate limiting and validation)
router.post(
    '/:fieldId',
    verifyToken,
    analysisLimiter,
    validateParams('analyzeField'),
    analysisController.analyzeField
);

// GET /api/analysis/history - Get analysis history
router.get(
    '/history',
    verifyToken,
    analysisController.getHistory
);

module.exports = router;
