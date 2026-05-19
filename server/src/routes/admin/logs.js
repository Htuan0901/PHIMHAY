const express = require('express');
const { validate } = require('../../middleware/validate');
const { listLogsQuerySchema } = require('../../validators/adminValidators');
const adminLogsController = require('../../controllers/adminLogsController');

const router = express.Router();

router.get('/', validate(listLogsQuerySchema, 'query'), adminLogsController.listLogs);

module.exports = router;
