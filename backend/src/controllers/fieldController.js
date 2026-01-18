const Field = require('../models/fieldModel');

// Calculate area roughly if not provided (optional, better done in PostGIS with ST_Area but requires casting to geography)
// For MVP we accept hectares from client or store 0.

const createField = async (req, res) => {
    try {
        const { name, geojson, hectares, address } = req.body;
        const user_id = req.user.id;

        if (!name || !geojson) {
            return res.status(400).json({ message: 'Name and boundary (GeoJSON) are required' });
        }

        // Handle GeoJSON Feature vs Geometry
        let geometry = geojson;
        if (geojson.type === 'Feature') {
            geometry = geojson.geometry;
        }

        // Validate Geometry
        if (!geometry.coordinates || !['Polygon', 'MultiPolygon'].includes(geometry.type)) {
            return res.status(400).json({ message: 'Invalid GeoJSON: Must be a Polygon or MultiPolygon' });
        }

        const newField = await Field.create({
            user_id,
            name,
            geojson: geometry, // Store the geometry part
            hectares: hectares || 0,
            address
        });

        res.status(201).json(newField);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating field' });
    }
};

const getFields = async (req, res) => {
    try {
        const fields = await Field.findByUserId(req.user.id);
        res.json(fields);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching fields' });
    }
};

const deleteField = async (req, res) => {
    try {
        const result = await Field.delete(req.params.id, req.user.id);
        if (!result) {
            return res.status(404).json({ message: 'Field not found or not authorized' });
        }
        res.json({ message: 'Field deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createField,
    getFields,
    deleteField
};
