const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, requireAuth, resolveRole } = require('../middleware/auth');
const config = require('../config');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/authProfileValidators');
const { getSettings } = require('../services/settingsService');
const { logActivity } = require('../services/activityLogService');

const router = express.Router();

function publicUser(u) {
  const role = resolveRole(u);
  return {
    id: u._id,
    email: u.email,
    displayName: u.displayName,
    role,
    isAdmin: role === 'admin',
    isVip: u.isVip,
    vipExpiresAt: u.vipExpiresAt,
    isUnlimitedVip: !!u.isUnlimitedVip,
    banned: !!u.banned
  };
}

router.post('/register', async (req, res) => {
  try {
    const settings = await getSettings();
    const adminSecret = req.headers['x-admin-secret'];
    const isBootstrapAdmin =
      config.initialAdminSecret &&
      adminSecret &&
      String(adminSecret) === String(config.initialAdminSecret);
    if (!settings.registrationEnabled && !isBootstrapAdmin) {
      return res.status(403).json({ error: 'Đăng ký tạm đóng' });
    }

    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName)
      return res.status(400).json({ error: 'Email, mật khẩu và tên đăng nhập là bắt buộc' });
    const lowerEmail = String(email).toLowerCase();
    const emailExists = await User.findOne({ email: lowerEmail });
    if (emailExists) return res.status(409).json({ error: 'Email đã được dùng' });

    const lowerDisplayName = String(displayName).toLowerCase().trim();
    const displayNameExists = await User.findOne({ displayName: lowerDisplayName });
    if (displayNameExists) return res.status(409).json({ error: 'Tên đăng nhập đã được dùng' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: lowerEmail,
      passwordHash,
      displayName: lowerDisplayName,
      role: isBootstrapAdmin ? 'admin' : 'user',
      isAdmin: !!isBootstrapAdmin
    });
    const token = signToken(user);
    await logActivity(req, {
      action: 'user.register',
      targetType: 'user',
      targetId: user._id
    });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Lỗi đăng ký' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const lowerIdentifier = String(identifier || '').toLowerCase();
    const user = await User.findOne({
      $or: [{ email: lowerIdentifier }, { displayName: lowerIdentifier }]
    });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }
    if (user.banned) {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = signToken(user);
    await logActivity(req, {
      action: 'user.login',
      targetType: 'user',
      targetId: user._id
    });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Lỗi đăng nhập' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const u = req.user;
  res.json({
    ...publicUser(u),
    phoneNumber: u.phoneNumber || '',
    dateOfBirth: u.dateOfBirth ? u.dateOfBirth.toISOString().slice(0, 10) : null,
    gender: u.gender || ''
  });
});

router.put('/me', requireAuth, validate(updateProfileSchema), async (req, res) => {
  try {
    const id = String(req.user?._id);
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Tài khoản không hợp lệ' });

    const { displayName, email, phoneNumber, dateOfBirth, gender, password } = req.body;

    if (email !== undefined) {
      const lowerEmail = String(email).toLowerCase().trim();
      const exists = await User.findOne({ email: lowerEmail, _id: { $ne: user._id } }).lean();
      if (exists) return res.status(409).json({ error: 'Email đã được dùng' });
      user.email = lowerEmail;
    }

    if (displayName !== undefined) {
      const lowerDisplayName = String(displayName).trim().toLowerCase();
      const exists = await User.findOne({
        displayName: lowerDisplayName,
        _id: { $ne: user._id }
      }).lean();
      if (exists) return res.status(409).json({ error: 'Tên đăng nhập đã được dùng' });
      user.displayName = lowerDisplayName;
    }

    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber ? String(phoneNumber).trim() : '';
    }

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth ? new Date(`${dateOfBirth}T00:00:00.000Z`) : null;
    }

    if (gender !== undefined) {
      user.gender = gender ? String(gender).trim() : '';
    }

    if (password !== undefined && String(password).trim()) {
      user.passwordHash = await bcrypt.hash(String(password), 10);
    }

    await user.save();

    return res.json({
      ...publicUser(user),
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
      gender: user.gender || ''
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Cập nhật thất bại' });
  }
});

module.exports = router;
