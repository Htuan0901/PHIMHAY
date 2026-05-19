const express = require('express');
const { validate } = require('../../middleware/validate');
const { settingsUpdateSchema } = require('../../validators/adminValidators');
const adminSettingsController = require('../../controllers/adminSettingsController');

const router = express.Router();

router.get('/', adminSettingsController.getSettings);
router.put('/', validate(settingsUpdateSchema), adminSettingsController.updateSettings);

module.exports = router;
