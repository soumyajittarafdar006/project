require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { init: initSocket } = require('./services/socketService');
const sensorRoutes = require('./routes/sensor');
const settingsRoutes = require('./routes/settings');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
initSocket(server);

// API Routes
app.use('/api/sensor', sensorRoutes);
app.use('/api/settings', settingsRoutes);

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ESP32 Temperature Monitoring API',
    timestamp: new Date().toISOString()
  });
});

// Serve static React production build if available (Unified single-port deployment)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
  console.log('📦 Serving production frontend build from:', frontendDistPath);
}

// 404 Route Handler for API
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

server.listen(PORT, () => {
  console.log(`🚀 ESP32 Temperature Monitor Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server initialized`);
  console.log(`🌡️  Ready to accept POST data at http://localhost:${PORT}/api/sensor/data`);
});
