const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken); // Protect all field routes

router.post('/', fieldController.createField);
router.get('/', fieldController.getFields);
router.delete('/:id', fieldController.deleteField);

module.exports = router;
