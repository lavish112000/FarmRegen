const express = require('express');
const router = express.Router();
const db = require('../config/db');
const User = require('../models/userModel');

// Diagnostic endpoint to test database connection
router.get('/test-db', async (req, res) => {
    try {
        // Test 1: Basic query
        const testQuery = await db.query('SELECT NOW()');

        // Test 2: Check if users table exists
        const tableCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);

        // Test 3: Count users
        const userCount = await db.query('SELECT COUNT(*) FROM users');

        // Test 4: Try to find a specific user
        const testUser = await User.findByEmail('lalitchoudhary112000@gmail.com');

        res.json({
            success: true,
            tests: {
                dbConnection: { status: 'OK', time: testQuery.rows[0].now },
                usersTableExists: tableCheck.rows.length > 0,
                userCount: userCount.rows[0].count,
                testUserFound: !!testUser,
                testUserData: testUser ? {
                    id: testUser.id,
                    email: testUser.email,
                    full_name: testUser.full_name,
                    hasPassword: !!testUser.password_hash
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
