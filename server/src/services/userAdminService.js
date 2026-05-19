const bcrypt = require('bcryptjs');
const User = require('../models/User');

function formatUser(u) {
  const vipActive = u.isVip && (u.isUnlimitedVip || !u.vipExpiresAt || new Date(u.vipExpiresAt) > new Date());
  return {
    id: u._id,
    username: u.displayName,
    email: u.email,
    role: u.role || (u.isAdmin ? 'admin' : 'user'),
    isVIP: !!u.isVip,
    vipExpireAt: u.vipExpiresAt,
    isUnlimitedVIP: !!u.isUnlimitedVip,
    vipActive,
    banned: !!u.banned,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    isAdmin: !!u.isAdmin
  };
}

function buildUserQuery(filters) {
  const and = [];
  const { search, role, vip, banned } = filters;

  if (search) {
    const s = String(search).trim();
    const re = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    and.push({ $or: [{ displayName: re }, { email: re }] });
  }

  if (role) {
    if (role === 'admin') {
      and.push({ $or: [{ role: 'admin' }, { isAdmin: true }] });
    } else {
      and.push({ role });
    }
  }

  if (vip === 'true') {
    and.push({ isVip: true });
  } else if (vip === 'false') {
    and.push({ isVip: { $ne: true } });
  } else if (vip === 'unlimited') {
    and.push({ isUnlimitedVip: true });
  } else if (vip === 'expired') {
    and.push({
      isVip: true,
      isUnlimitedVip: { $ne: true },
      vipExpiresAt: { $lte: new Date() }
    });
  }

  if (banned === 'true') and.push({ banned: true });
  else if (banned === 'false') and.push({ banned: { $ne: true } });

  return and.length ? { $and: and } : {};
}

async function listUsers({ page = 1, limit = 20, ...filters }) {
  const q = buildUserQuery(filters);
  const skip = (Math.max(1, page) - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(q)
  ]);
  return {
    items: items.map(formatUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  };
}

async function getUserById(id) {
  const u = await User.findById(id).lean();
  if (!u) return null;
  return formatUser(u);
}

async function setBanned(id, banned) {
  const user = await User.findByIdAndUpdate(id, { banned: !!banned }, { new: true }).lean();
  if (!user) return null;
  return formatUser(user);
}

async function deleteUser(id, actorId) {
  if (String(id) === String(actorId)) {
    const err = new Error('Không thể xóa chính mình');
    err.status = 400;
    throw err;
  }
  const r = await User.findByIdAndDelete(id);
  return !!r;
}

async function resetPassword(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const user = await User.findByIdAndUpdate(id, { passwordHash }, { new: true }).lean();
  if (!user) return null;
  return formatUser(user);
}

async function setRole(id, role) {
  const user = await User.findById(id);
  if (!user) return null;
  user.role = role;
  user.isAdmin = role === 'admin';
  await user.save();
  return formatUser(user.toObject());
}

async function updateVip(id, payload) {
  const user = await User.findById(id);
  if (!user) return null;

  if (payload.removeVip) {
    user.isVip = false;
    user.isUnlimitedVip = false;
    user.vipExpiresAt = null;
  } else if (payload.enableUnlimited) {
    user.isVip = true;
    user.isUnlimitedVip = true;
    user.vipExpiresAt = null;
  } else {
    if (payload.isVip !== undefined) user.isVip = !!payload.isVip;
    if (payload.vipExpireAt !== undefined) {
      user.vipExpiresAt = payload.vipExpireAt ? new Date(payload.vipExpireAt) : null;
      user.isUnlimitedVip = false;
    }
    if (payload.addDays) {
      const days = Number(payload.addDays);
      const base =
        user.vipExpiresAt && new Date(user.vipExpiresAt) > new Date()
          ? new Date(user.vipExpiresAt)
          : new Date();
      base.setDate(base.getDate() + days);
      user.vipExpiresAt = base;
      user.isVip = true;
      user.isUnlimitedVip = false;
    }
  }

  await user.save();
  return formatUser(user.toObject());
}

module.exports = {
  formatUser,
  listUsers,
  getUserById,
  setBanned,
  deleteUser,
  resetPassword,
  setRole,
  updateVip
};
