const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_oJATBaHb2vf5@ep-dark-hat-ahwxca74-pooler.c-3.us-east-1.aws.neon.tech/FarmRegen%20?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Migrating database...');

        // Add columns if they don't exist
        await pool.query(`
            ALTER TABLE field_analyses 
            ADD COLUMN IF NOT EXISTS ndvi_stddev DECIMAL(10, 4),
            ADD COLUMN IF NOT EXISTS ndmi_mean DECIMAL(10, 4),
            ADD COLUMN IF NOT EXISTS evi_mean DECIMAL(10, 4),
            ADD COLUMN IF NOT EXISTS savi_mean DECIMAL(10, 4),
            ADD COLUMN IF NOT EXISTS moisture_status VARCHAR(50),
            ADD COLUMN IF NOT EXISTS indices_data JSONB;
        `);

        console.log('✅ Migration successful: Added missing columns.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
