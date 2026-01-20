const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const verifyToken = require('../middleware/authMiddleware');

// All export routes require authentication
router.use(verifyToken);

// GET /api/export/csv - Export all analysis data as CSV
router.get('/csv', exportController.exportCSV);

// GET /api/export/excel - Export all analysis data as Excel
router.get('/excel', exportController.exportExcel);

// GET /api/export/field/:fieldId - Export single field's analysis history
// Query param: format=csv|xlsx (default: csv)
router.get('/field/:fieldId', exportController.exportFieldAnalysis);

module.exports = router;
