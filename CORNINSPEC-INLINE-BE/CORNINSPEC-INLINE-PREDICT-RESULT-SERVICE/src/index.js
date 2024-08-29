// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const scheduleDeleteOldRecords = require('./tasks/deleteOldRecords');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();

// Validate required environment variables
if (!process.env.ALLOWED_ORIGINS || !process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error('Missing required environment variables. Exiting...');
    process.exit(1);
}

// Middleware for parsing JSON requests
app.use(express.json());

// Configure CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    optionsSuccessStatus: 200
}));

// Rate limiting to prevent abuse
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes."
}));

// Import routes
const authRoutes = require('./routes/authRoutes');
const resultRoutes = require('./routes/resultRoutes');
const interfaceRoutes = require('./routes/interfaceRoutes');

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

// Use routes
app.use('/v1/auth', authRoutes);
app.use('/v1/results', authenticateToken, resultRoutes);
app.use('/v1/interfaces', authenticateToken, interfaceRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Initialize scheduled tasks
scheduleDeleteOldRecords();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send({ message: 'Internal Server Error', error: err.message });
});

// Start server
const PORT = process.env.PREDICT_RESULT_PORT || 9002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
