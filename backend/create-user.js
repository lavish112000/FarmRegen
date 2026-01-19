const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const connectionString = 'postgresql://neondb_owner:npg_oJATBaHb2vf5@ep-dark-hat-ahwxca74-pooler.c-3.us-east-1.aws.neon.tech/FarmRegen%20?sslmode=require';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createUser() {
    try {
        console.log('\n=== CREATE NEW USER ACCOUNT ===\n');

        const fullName = await question('Enter full name: ');
        const email = await question('Enter email: ');
        const phone = await question('Enter phone (optional, press Enter to skip): ');
        const password = await question('Enter password: ');

        console.log('\nCreating account...');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const result = await pool.query(
            `INSERT INTO users (full_name, email, phone, password_hash) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, full_name, email, created_at`,
            [fullName, email, phone || null, hashedPassword]
        );

        console.log('\n✅ Account created successfully!\n');
        console.log('Account Details:');
        console.log(`  Name: ${result.rows[0].full_name}`);
        console.log(`  Email: ${result.rows[0].email}`);
        console.log(`  ID: ${result.rows[0].id}`);
        console.log(`  Created: ${result.rows[0].created_at}`);
        console.log('\nYou can now log in at: https://farm-regen.vercel.app/login');

    } catch (error) {
        if (error.code === '23505') {
            console.error('\n❌ Error: Email already exists in database.');
        } else {
            console.error('\n❌ Error:', error.message);
        }
    } finally {
        rl.close();
        await pool.end();
    }
}

createUser();
