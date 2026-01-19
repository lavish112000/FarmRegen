-- FarmRegen Database Schema for Neon PostgreSQL
-- Run this in Neon SQL Editor after creating your database
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- Fields table with PostGIS geometry
CREATE TABLE IF NOT EXISTS fields (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    hectares DECIMAL(10, 2) DEFAULT 0,
    address TEXT,
    soil_health_score INTEGER,
    last_analysis_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for fields
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_boundary ON fields USING GIST(boundary);
-- Field analyses table
CREATE TABLE IF NOT EXISTS field_analyses (
    id SERIAL PRIMARY KEY,
    field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    ndvi_mean DECIMAL(5, 4),
    ndvi_std_dev DECIMAL(5, 4),
    soil_score INTEGER,
    satellite_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for analyses
CREATE INDEX IF NOT EXISTS idx_field_analyses_field_id ON field_analyses(field_id);
CREATE INDEX IF NOT EXISTS idx_field_analyses_date ON field_analyses(analysis_date DESC);
-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE
UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Verify PostGIS is working
SELECT PostGIS_version();
-- Sample query to verify geometry support
-- SELECT ST_AsText(boundary) FROM fields LIMIT 1;