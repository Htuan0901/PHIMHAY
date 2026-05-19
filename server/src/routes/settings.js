const express = require('express');
const adminSettingsController = require('../controllers/adminSettingsController');

const router = express.Router();

router.get('/public', adminSettingsController.getPublicSettings);

module.exports = router;
