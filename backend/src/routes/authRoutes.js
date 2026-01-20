const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validator');
const { authLimiter, refreshLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/signup - with validation
router.post('/signup', authLimiter, validate('signup'), authController.signup);

// POST /api/auth/login - with validation
router.post('/login', authLimiter, validate('login'), authController.login);

// POST /api/auth/refresh - refresh access token
router.post('/refresh', refreshLimiter, authController.refreshToken);

// Protected routes
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/password', verifyToken, authController.changePassword);

module.exports = router;
