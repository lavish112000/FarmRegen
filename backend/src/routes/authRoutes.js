const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all auth routes
router.use(authLimiter);

// POST /api/auth/signup - with validation
router.post('/signup', validate('signup'), authController.signup);

// POST /api/auth/login - with validation
router.post('/login', validate('login'), authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
