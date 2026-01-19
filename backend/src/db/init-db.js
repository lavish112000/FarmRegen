const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function initDb() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected. Running schema script...');

        // Split by semicolons allows basic multiple statements, 
        // but client.query can often handle multiple statements in one go depending on config.
        // For safety with simple scripts, we can run the whole thing.
        await client.query(schemaSql);

        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        console.error('HINT: Check your DATABASE_URL in backend/.env');
        process.exit(1);
    } finally {
        await client.end();
    }
}

initDb();
