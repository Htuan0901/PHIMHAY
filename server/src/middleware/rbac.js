const User = require('../models/User');

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role || (req.user?.isAdmin ? 'admin' : 'user');
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  const role = req.user?.role || (req.user?.isAdmin ? 'admin' : 'user');
  if (role !== 'admin' && !req.user?.isAdmin) {
    return res.status(403).json({ error: 'Chỉ admin' });
  }
  next();
}

function requireModeratorOrAdmin(req, res, next) {
  const role = req.user?.role || (req.user?.isAdmin ? 'admin' : 'user');
  if (!['admin', 'moderator'].includes(role) && !req.user?.isAdmin) {
    return res.status(403).json({ error: 'Cần quyền moderator hoặc admin' });
  }
  next();
}

async function checkBanned(req, res, next) {
  if (!req.user?.banned) return next();
  return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
}

module.exports = { requireRole, requireAdmin, requireModeratorOrAdmin, checkBanned };
