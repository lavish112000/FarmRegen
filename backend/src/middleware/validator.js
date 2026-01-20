const Joi = require('joi');

// Validation schemas
const schemas = {
    // User registration
    signup: Joi.object({
        full_name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(''),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            })
    }),

    // User login
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Field creation
    createField: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        geojson: Joi.object().unknown().required(),
        hectares: Joi.number().min(0.01).max(10000).optional(),
        address: Joi.string().max(500).optional().allow('')
    }),

    // Field update
    updateField: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        address: Joi.string().max(500).optional().allow('')
    }),

    // User profile update
    updateProfile: Joi.object({
        full_name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow('')
    }),

    // Analysis validation
    analyzeField: Joi.object({
        fieldId: Joi.string().required() // Basic check, relying on controller DB lookup for 404
    })
};

// Validation middleware factory
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return res.status(500).json({ message: 'Validation schema not found' });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

// New middleware for parameter validation
const validateParams = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return res.status(500).json({ message: 'Validation schema not found' });
        }

        // Validate req.params against schema
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        // Update params with sanitized values
        req.params = value;
        next();
    };
};

module.exports = { validate, validateParams, schemas };
