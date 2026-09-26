const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');

// GET current settings
router.get('/', getSettings);

// POST update settings
router.post('/', updateSettings);

module.exports = router;
