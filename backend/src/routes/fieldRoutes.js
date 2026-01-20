const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const verifyToken = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(verifyToken);

// GET /api/fields - Get all user's fields
router.get('/', fieldController.getFields);

// GET /api/fields/:id - Get single field
router.get('/:id', fieldController.getFieldById);

// POST /api/fields - Create new field (with validation)
router.post('/', validate('createField'), fieldController.createField);

// PUT /api/fields/:id - Update field (name/address)
router.put('/:id', validate('updateField'), fieldController.updateField);

// DELETE /api/fields/:id - Delete field
router.delete('/:id', fieldController.deleteField);

module.exports = router;
