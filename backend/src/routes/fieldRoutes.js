const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const verifyToken = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(verifyToken);

// GET /api/fields - Get all user's fields
router.get('/', fieldController.getFields);

// POST /api/fields - Create new field (with validation)
router.post('/', validate('createField'), fieldController.createField);

// PUT /api/fields/:id - Update field (with validation)
router.put('/:id', validate('updateField'), fieldController.updateField);

module.exports = router;
