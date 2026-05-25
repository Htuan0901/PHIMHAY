const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/rbac');
const { adminLimiter } = require('../../middleware/rateLimit');

const usersRoutes = require('./users');
const dashboardRoutes = require('./dashboard');
const logsRoutes = require('./logs');
const settingsRoutes = require('./settings');
const moviesRoutes = require('./movies');

const router = express.Router();

router.use(requireAuth, requireAdmin, adminLimiter);

router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logsRoutes);
router.use('/settings', settingsRoutes);
router.use('/', moviesRoutes);

module.exports = router;
