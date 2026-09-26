const { dbAsync } = require('../database/db');
const { broadcastTemperatureUpdate, broadcastAlert } = require('../services/socketService');

// In-memory track for device online/offline status
const activeDevices = new Map();
const OFFLINE_THRESHOLD_MS = 15000; // 15 seconds

// Helper to determine status based on thresholds
const calculateStatus = (temperature, settings) => {
  const min = parseFloat(settings.minTemp);
  const max = parseFloat(settings.maxTemp);
  const critical = parseFloat(settings.criticalTemp);
  const temp = parseFloat(temperature);

  if (temp > critical) return 'Critical';
  if (temp > max) return 'Warning';
  if (temp < min) return 'Warning';
  return 'Normal';
};

// POST /api/sensor/data
const postSensorData = async (req, res) => {
  try {
    const { deviceId, temperature } = req.body;

    // Validation
    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing deviceId' });
    }

    const tempVal = parseFloat(temperature);
    if (isNaN(tempVal) || tempVal < -50 || tempVal > 150) {
      return res.status(400).json({ error: 'Invalid temperature value. Must be between -50 and 150 °C' });
    }

    // Get active settings
    let settings = await dbAsync.get('SELECT * FROM settings WHERE id = 1');
    if (!settings) {
      settings = { minTemp: 20.0, maxTemp: 35.0, criticalTemp: 40.0 };
    }

    const status = calculateStatus(tempVal, settings);
    const timestamp = new Date().toISOString();

    // 1. Insert reading into DB
    const insertResult = await dbAsync.run(
      'INSERT INTO readings (deviceId, temperature, status, timestamp) VALUES (?, ?, ?, ?)',
      [deviceId.trim(), tempVal, status, timestamp]
    );

    const reading = {
      id: insertResult.id,
      deviceId: deviceId.trim(),
      temperature: tempVal,
      status,
      timestamp
    };

    // 2. Update active device state
    activeDevices.set(deviceId.trim(), {
      lastSeen: Date.now(),
      status,
      lastTemperature: tempVal
    });

    // 3. Handle Alert generation if Warning or Critical
    let alertData = null;
    if (status === 'Warning' || status === 'Critical') {
      let message = '';
      if (tempVal > settings.criticalTemp) {
        message = `CRITICAL: Temperature (${tempVal.toFixed(1)}°C) exceeded critical limit of ${settings.criticalTemp}°C!`;
      } else if (tempVal > settings.maxTemp) {
        message = `WARNING: Temperature (${tempVal.toFixed(1)}°C) exceeded maximum limit of ${settings.maxTemp}°C!`;
      } else if (tempVal < settings.minTemp) {
        message = `WARNING: Temperature (${tempVal.toFixed(1)}°C) dropped below minimum limit of ${settings.minTemp}°C!`;
      }

      const alertInsert = await dbAsync.run(
        'INSERT INTO alerts (deviceId, temperature, type, message, timestamp) VALUES (?, ?, ?, ?, ?)',
        [deviceId.trim(), tempVal, status, message, timestamp]
      );

      alertData = {
        id: alertInsert.id,
        deviceId: deviceId.trim(),
        temperature: tempVal,
        type: status,
        message,
        timestamp
      };

      // Broadcast alert
      broadcastAlert(alertData);
    }

    // 4. Broadcast live update to WebSockets
    broadcastTemperatureUpdate(reading);

    return res.status(201).json({
      success: true,
      message: 'Data recorded successfully',
      reading,
      alert: alertData
    });
  } catch (error) {
    console.error('Error recording sensor data:', error);
    return res.status(500).json({ error: 'Failed to record sensor data', details: error.message });
  }
};

// GET /api/sensor/latest
const getLatestReading = async (req, res) => {
  try {
    const reading = await dbAsync.get('SELECT * FROM readings ORDER BY id DESC LIMIT 1');
    return res.json({ success: true, data: reading || null });
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return res.status(500).json({ error: 'Failed to fetch latest reading' });
  }
};

// GET /api/sensor/history
const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const readings = await dbAsync.all(
      'SELECT * FROM readings ORDER BY id DESC LIMIT ?',
      [limit]
    );
    // Reverse array so chart gets chronological order (oldest to newest)
    const sorted = [...readings].reverse();
    return res.json({ success: true, count: readings.length, data: sorted });
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// GET /api/sensor/stats
const getStats = async (req, res) => {
  try {
    const agg = await dbAsync.get(`
      SELECT 
        COUNT(*) as totalReadings,
        MIN(temperature) as minimum,
        MAX(temperature) as maximum,
        AVG(temperature) as average
      FROM readings
    `);

    const latest = await dbAsync.get('SELECT temperature, status FROM readings ORDER BY id DESC LIMIT 1');

    if (!agg || agg.totalReadings === 0) {
      return res.json({
        success: true,
        stats: {
          current: 0,
          minimum: 0,
          maximum: 0,
          average: 0,
          totalReadings: 0,
          status: 'Offline'
        }
      });
    }

    return res.json({
      success: true,
      stats: {
        current: latest ? parseFloat(latest.temperature.toFixed(1)) : 0,
        minimum: agg.minimum !== null ? parseFloat(agg.minimum.toFixed(1)) : 0,
        maximum: agg.maximum !== null ? parseFloat(agg.maximum.toFixed(1)) : 0,
        average: agg.average !== null ? parseFloat(agg.average.toFixed(1)) : 0,
        totalReadings: agg.totalReadings,
        status: latest ? latest.status : 'Offline'
      }
    });
  } catch (error) {
    console.error('Error fetching sensor stats:', error);
    return res.status(500).json({ error: 'Failed to calculate stats' });
  }
};

// GET /api/sensor/status
const getStatus = async (req, res) => {
  try {
    const latest = await dbAsync.get('SELECT deviceId, timestamp FROM readings ORDER BY id DESC LIMIT 1');

    if (!latest) {
      return res.json({
        success: true,
        online: false,
        deviceId: 'ESP32-01',
        lastSeen: null,
        message: 'No sensor data received yet'
      });
    }

    const lastTime = new Date(latest.timestamp).getTime();
    const now = Date.now();
    const isOnline = (now - lastTime) < OFFLINE_THRESHOLD_MS;

    return res.json({
      success: true,
      online: isOnline,
      deviceId: latest.deviceId,
      lastSeen: latest.timestamp,
      secondsAgo: Math.round((now - lastTime) / 1000)
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
};

// GET /api/sensor/alerts
const getAlerts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const alerts = await dbAsync.all('SELECT * FROM alerts ORDER BY id DESC LIMIT ?', [limit]);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

module.exports = {
  postSensorData,
  getLatestReading,
  getHistory,
  getStats,
  getStatus,
  getAlerts
};
