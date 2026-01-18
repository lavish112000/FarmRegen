const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// GET /api/reports/:analysisId/download
router.get('/:analysisId/download', verifyToken, reportController.generateReport);

module.exports = router;
