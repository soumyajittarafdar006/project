const { dbAsync } = require('../database/db');
const { broadcastSettingsUpdate } = require('../services/socketService');

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await dbAsync.get('SELECT minTemp, maxTemp, criticalTemp, updatedAt FROM settings WHERE id = 1');
    if (!settings) {
      settings = { minTemp: 20.0, maxTemp: 35.0, criticalTemp: 40.0 };
    }
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// POST /api/settings
const updateSettings = async (req, res) => {
  try {
    const { minTemp, maxTemp, criticalTemp } = req.body;

    const min = parseFloat(minTemp);
    const max = parseFloat(maxTemp);
    const critical = parseFloat(criticalTemp);

    // Validation
    if (isNaN(min) || isNaN(max) || isNaN(critical)) {
      return res.status(400).json({ error: 'All threshold values must be valid numbers' });
    }

    if (min >= max) {
      return res.status(400).json({ error: 'Minimum temperature must be less than maximum temperature' });
    }

    if (max >= critical) {
      return res.status(400).json({ error: 'Maximum temperature must be less than critical temperature' });
    }

    const updatedAt = new Date().toISOString();

    await dbAsync.run(
      'UPDATE settings SET minTemp = ?, maxTemp = ?, criticalTemp = ?, updatedAt = ? WHERE id = 1',
      [min, max, critical, updatedAt]
    );

    const updated = { minTemp: min, maxTemp: max, criticalTemp: critical, updatedAt };

    // Broadcast updated settings to connected frontend clients
    broadcastSettingsUpdate(updated);

    return res.json({
      success: true,
      message: 'Threshold settings updated successfully',
      settings: updated
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
