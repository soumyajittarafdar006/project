const express = require('express');
const router = express.Router();
const {
  postSensorData,
  getLatestReading,
  getHistory,
  getStats,
  getStatus,
  getAlerts
} = require('../controllers/sensorController');

// POST temperature reading from ESP32 or simulator
router.post('/data', postSensorData);

// GET latest reading
router.get('/latest', getLatestReading);

// GET historical readings
router.get('/history', getHistory);

// GET aggregated statistics
router.get('/stats', getStats);

// GET ESP32 online/offline status
router.get('/status', getStatus);

// GET temperature threshold alerts
router.get('/alerts', getAlerts);

module.exports = router;
