const { Pool } = require('pg');
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

console.log(`Loading .env from: ${envPath}`);
console.log(`DATABASE_URL is ${process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED'}`);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
    try {
        const res = await pool.query('SELECT id, full_name, email, password_hash, created_at FROM users');
        console.log('--- Registered Users ---');
        res.rows.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Name: ${user.full_name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Hashed Password: ${user.password_hash.substring(0, 20)}...`); // Truncate for display
            console.log('------------------------');
        });
        if (res.rows.length === 0) {
            console.log("No users found.");
        }
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
}

checkUsers();
