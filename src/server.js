const path = require('path');

// Load .env from executable's directory when packaged, otherwise from project root
const envPath = process.pkg
    ? path.join(path.dirname(process.execPath), '.env')
    : path.join(__dirname, '..', '.env');

require('dotenv').config({ path: envPath });
const express = require('express');
const dataStore = require('./utils/dataStore');
const { authenticateToken } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Initialize data directories
dataStore.ensureDirectories();

// Health check (no auth required)
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes (no auth required)
app.use('/api/v1/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/v1/students', authenticateToken, studentRoutes);
app.use('/api/v1/courses', authenticateToken, courseRoutes);
app.use('/api/v1/enrollments', authenticateToken, enrollmentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   CampusCore API Server                   ║
║           Enterprise Training Backend for ACCELQ          ║
╠═══════════════════════════════════════════════════════════╣
║  Base URL: http://localhost:${PORT}/api/v1                   ║
║                                                           ║
║  Auth Endpoints:                                          ║
║    POST /api/v1/auth/login/apikey                         ║
║    POST /api/v1/auth/login                                ║
║                                                           ║
║  Protected Endpoints (require Bearer token):              ║
║    /api/v1/students                                       ║
║    /api/v1/courses                                        ║
║    /api/v1/enrollments                                    ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
