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

// CẤU HÌNH CORS (Thêm đoạn này vào)
app.use(cors({
    origin: 'https://phimhay-1oml.vercel.app', // Cho phép Frontend Vercel truy cập
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức cho phép
    credentials: true // Bật nếu bạn có dùng cookie/session
}));

router.use(requireAuth, requireAdmin, adminLimiter);

router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logsRoutes);
router.use('/settings', settingsRoutes);
router.use('/', moviesRoutes);

module.exports = router;
