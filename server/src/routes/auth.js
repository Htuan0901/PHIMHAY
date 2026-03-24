const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, requireAuth } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
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
    const adminSecret = req.headers['x-admin-secret'];
    const isAdmin =
      config.initialAdminSecret &&
      adminSecret &&
      String(adminSecret) === String(config.initialAdminSecret);
    const user = await User.create({
      email: lowerEmail,
      passwordHash,
      displayName: lowerDisplayName,
      isAdmin: !!isAdmin
    });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        isVip: user.isVip,
        vipExpiresAt: user.vipExpiresAt
      }
    });
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
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        isVip: user.isVip,
        vipExpiresAt: user.vipExpiresAt
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Lỗi đăng nhập' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const u = req.user;
  res.json({
    id: u._id,
    email: u.email,
    displayName: u.displayName,
    isAdmin: u.isAdmin,
    isVip: u.isVip,
    vipExpiresAt: u.vipExpiresAt
  });
});

module.exports = router;
