-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fields Table
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    boundary GEOMETRY(POLYGON, 4326), -- WGS 84
    hectares NUMERIC(10,2),
    address TEXT,
    last_analysis_date TIMESTAMP WITH TIME ZONE,
    soil_health_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_fields_boundary ON fields USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);

-- Field Analysis History (Optional/Extended)
CREATE TABLE IF NOT EXISTS field_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ndvi_mean FLOAT,
  ndvi_stddev FLOAT,
  ndmi_mean FLOAT,
  evi_mean FLOAT,
  savi_mean FLOAT,
  soil_score INTEGER,
  moisture_status VARCHAR(50),
  satellite_image_url TEXT,
  indices_data JSONB,  -- Store full indices data as JSON for flexibility
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_analyses_field_id ON field_analyses(field_id);
