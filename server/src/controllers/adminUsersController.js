const userAdminService = require('../services/userAdminService');
const { logActivity } = require('../services/activityLogService');

exports.listUsers = async (req, res, next) => {
  try {
    const result = await userAdminService.listUsers(req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await userAdminService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await userAdminService.setBanned(req.params.id, true);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
    await logActivity(req, {
      action: 'admin.user.ban',
      targetType: 'user',
      targetId: req.params.id,
      metadata: { username: user.username }
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const user = await userAdminService.setBanned(req.params.id, false);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
    await logActivity(req, {
      action: 'admin.user.unban',
      targetType: 'user',
      targetId: req.params.id
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const ok = await userAdminService.deleteUser(req.params.id, req.user._id);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy' });
    await logActivity(req, {
      action: 'admin.user.delete',
      targetType: 'user',
      targetId: req.params.id
    });
    res.json({ ok: true });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    next(e);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await userAdminService.resetPassword(req.params.id, req.body.newPassword);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
    await logActivity(req, {
      action: 'admin.user.reset_password',
      targetType: 'user',
      targetId: req.params.id
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.setRole = async (req, res, next) => {
  try {
    const user = await userAdminService.setRole(req.params.id, req.body.role);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
    await logActivity(req, {
      action: 'admin.user.role_change',
      targetType: 'user',
      targetId: req.params.id,
      metadata: { role: req.body.role }
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

exports.updateVip = async (req, res, next) => {
  try {
    const user = await userAdminService.updateVip(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
    await logActivity(req, {
      action: 'admin.user.vip_update',
      targetType: 'user',
      targetId: req.params.id,
      metadata: req.body
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
};
