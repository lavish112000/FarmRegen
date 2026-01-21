-- Migration: Add additional vegetation indices columns to field_analyses
-- Run this migration to update existing databases

-- Add new columns for additional indices (if they don't exist)
DO $$ 
BEGIN
    -- Add ndvi_stddev column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'field_analyses' AND column_name = 'ndvi_stddev') THEN
        ALTER TABLE field_analyses ADD COLUMN ndvi_stddev FLOAT;
    END IF;

    -- Add ndmi_mean column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'field_analyses' AND column_name = 'ndmi_mean') THEN
        ALTER TABLE field_analyses ADD COLUMN ndmi_mean FLOAT;
    END IF;

    -- Add evi_mean column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'field_analyses' AND column_name = 'evi_mean') THEN
        ALTER TABLE field_analyses ADD COLUMN evi_mean FLOAT;
    END IF;

    -- Add savi_mean column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'field_analyses' AND column_name = 'savi_mean') THEN
        ALTER TABLE field_analyses ADD COLUMN savi_mean FLOAT;
    END IF;

    -- Add moisture_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'field_analyses' AND column_name = 'moisture_status') THEN
        ALTER TABLE field_analyses ADD COLUMN moisture_status VARCHAR(50);
    END IF;

    -- Add indices_data JSONB column for full indices data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'field_analyses' AND column_name = 'indices_data') THEN
        ALTER TABLE field_analyses ADD COLUMN indices_data JSONB;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN field_analyses.ndmi_mean IS 'Normalized Difference Moisture Index - vegetation water content';
COMMENT ON COLUMN field_analyses.evi_mean IS 'Enhanced Vegetation Index - improved sensitivity in high biomass';
COMMENT ON COLUMN field_analyses.savi_mean IS 'Soil Adjusted Vegetation Index - corrects for soil brightness';
COMMENT ON COLUMN field_analyses.indices_data IS 'Full JSON data for all vegetation indices including min, max, stddev';
