const express = require('express');
const adminDashboardController = require('../../controllers/adminDashboardController');

const router = express.Router();

router.get('/overview', adminDashboardController.getOverview);
router.get('/charts', adminDashboardController.getCharts);

module.exports = router;
