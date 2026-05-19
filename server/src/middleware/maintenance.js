const { getSettings } = require('../services/settingsService');

async function maintenanceCheck(req, res, next) {
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/health')) {
    return next();
  }
  try {
    const settings = await getSettings();
    if (settings.maintenanceMode) {
      const isAdmin =
        req.user?.role === 'admin' || req.user?.isAdmin;
      if (!isAdmin) {
        return res.status(503).json({ error: 'Hệ thống đang bảo trì', maintenanceMode: true });
      }
    }
  } catch {
    /* proceed if settings unavailable */
  }
  next();
}

module.exports = { maintenanceCheck };
