const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Database Connection
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

connectDB();

const authRoutes = require('./routes/authRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const reportRoutes = require('./routes/reportRoutes');
const earthEngineService = require('./services/earthEngine');

// Initialize Earth Engine
earthEngineService.initialize()
    .then(() => console.log('GEE Service Ready'))
    .catch(err => console.error('GEE Service Warning: Failed to only initialize. Analysis features may fail.', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Soil Health Monitoring Tool API' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
