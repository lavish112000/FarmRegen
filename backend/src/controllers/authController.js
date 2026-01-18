const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
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
            res.status(201).json({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            res.json({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    updateProfile
};
