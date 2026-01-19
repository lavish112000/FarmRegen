const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import middleware
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy - required for Render and other reverse proxies
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
app.use('/api/', apiLimiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging - use Winston stream
app.use(morgan('combined', { stream: logger.stream }));

// Database Connection - using pool from db.js
const db = require('./config/db');

// Test database connection on startup
db.query('SELECT NOW()')
    .then(() => logger.info('Connected to PostgreSQL database'))
    .catch(err => logger.error('Database connection error:', err));

const authRoutes = require('./routes/authRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const reportRoutes = require('./routes/reportRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const earthEngineService = require('./services/earthEngine');

// Initialize Earth Engine
earthEngineService.initialize()
    .then(() => logger.info('GEE Service Ready'))
    .catch(err => logger.error('GEE Service Warning: Failed to initialize. Analysis features may fail.', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/diagnostic', diagnosticRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Soil Health Monitoring Tool API' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start Server
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});

module.exports = app;
