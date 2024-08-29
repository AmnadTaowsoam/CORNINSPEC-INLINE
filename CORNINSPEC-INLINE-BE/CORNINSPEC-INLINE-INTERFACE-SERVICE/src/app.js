// app.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const authenticateToken = require('./middleware/authenticateToken');
const startConsumers = require('./consumers');
const deleteOldRecords = require('./tasks/deleteOldRecords');
const schedule = require('node-schedule');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    optionsSuccessStatus: 200
}));

// Rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const interfaceRoutes = require('./routes/interfaceRoutes');
const resultToSAPRoutes = require('./routes/resultToSAPRoutes');

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

app.use('/v1/api/auth', authRoutes);
app.use('/v1/interfaces', authenticateToken, interfaceRoutes);
app.use('/v1/api', resultToSAPRoutes);

startConsumers().catch(error => {
    console.error('Error starting consumers:', error);
    process.exit(1);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

// Schedule a task to delete old records every midnight
schedule.scheduleJob('0 0 * * *', async () => {
    try {
        await deleteOldRecords();
        console.log('Scheduled task: Old records deletion completed.');
    } catch (error) {
        console.error('Error executing scheduled deletion task:', error.message);
    }
});

const PORT = process.env.INTERFACE_SERVICE_PORT || 9003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
