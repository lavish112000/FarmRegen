const { Pool } = require('pg');

// Note: Database name is "FarmRegen " with a trailing space
const connectionString = 'postgresql://neondb_owner:npg_oJATBaHb2vf5@ep-dark-hat-ahwxca74-pooler.c-3.us-east-1.aws.neon.tech/FarmRegen%20?sslmode=require';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
    try {
        console.log('Connecting to database...\n');

        const result = await pool.query(`
            SELECT id, full_name, email, phone, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);

        console.log('=== USER ACCOUNTS IN DATABASE ===\n');

        if (result.rows.length === 0) {
            console.log('No users found in database.');
        } else {
            result.rows.forEach((user, index) => {
                console.log(`${index + 1}. ${user.full_name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Phone: ${user.phone || 'N/A'}`);
                console.log(`   Created: ${user.created_at}`);
                console.log(`   ID: ${user.id}`);
                console.log('');
            });

            console.log(`Total users: ${result.rows.length}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
