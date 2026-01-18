const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    /**
     * Find user by email
     * @param {string} email
     */
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    },

    /**
     * Create a new user
     * @param {object} user - { email, password, full_name, phone }
     */
    async create({ email, password, full_name, phone }) {
        const passwordHash = await bcrypt.hash(password, 10);
        const query = `
      INSERT INTO users (email, password_hash, full_name, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, full_name, phone, created_at
    `;
        const values = [email, passwordHash, full_name, phone];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    /**
     * Find user by ID
     * @param {string} id
     */
    async findById(id) {
        const query = 'SELECT id, email, full_name, phone, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
};

module.exports = User;
