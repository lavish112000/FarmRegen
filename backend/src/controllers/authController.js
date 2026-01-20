const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const logger = require('../utils/logger');

const generateToken = (id, expiresIn = '30d') => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn,
    });
};

// Generate a shorter-lived access token and longer-lived refresh token
const generateTokens = (id) => {
    const accessToken = jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: '15m', // Short-lived access token
    });
    const refreshToken = jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Longer-lived refresh token
    });
    return { accessToken, refreshToken };
};

const signup = async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;

        // Check if user exists
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({ email, password, full_name, phone });

        if (user) {
            const tokens = generateTokens(user.id);
            res.status(201).json({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: 15 * 60 // 15 minutes in seconds
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        logger.error('Signup error', { error: error.message });
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const tokens = generateTokens(user.id);
            res.json({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: 15 * 60 // 15 minutes in seconds
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        logger.error('Login error', { error: error.message });
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
        });
    } catch (error) {
        logger.error('Get profile error', { error: error.message });
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { full_name, phone } = req.body;
        const userId = req.user.id;

        const result = await db.query(
            'UPDATE users SET full_name = $1, phone = $2 WHERE id = $3 RETURNING id, full_name, email, phone, created_at',
            [full_name, phone, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Update profile error', { error: error.message });
        res.status(500).json({ message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        // Verify password has uppercase, lowercase, and number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number' 
            });
        }

        // Get user with password hash
        const userResult = await db.query(
            'SELECT id, password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newPasswordHash, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        logger.error('Change password error', { error: error.message });
        res.status(500).json({ message: 'Server error' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        // Verify the refresh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's a refresh token type
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: 'Invalid token type' });
        }

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Generate new tokens
        const tokens = generateTokens(user.id);

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 15 * 60 // 15 minutes in seconds
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Refresh token expired. Please login again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        logger.error('Token refresh error', { error: error.message });
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    updateProfile,
    changePassword,
    refreshToken
};
