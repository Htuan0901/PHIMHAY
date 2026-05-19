const mongoose = require('mongoose');

const ROLES = ['user', 'moderator', 'admin'];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, unique: 'Tên đăng nhập đã được dùng', trim: true, lowercase: true },
    phoneNumber: { type: String, default: '', trim: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, default: '', trim: true },
    role: { type: String, enum: ROLES, default: 'user', index: true },
    /** @deprecated use role === 'admin' — kept in sync via pre-save */
    isAdmin: { type: Boolean, default: false },
    isVip: { type: Boolean, default: false },
    vipExpiresAt: { type: Date, default: null },
    isUnlimitedVip: { type: Boolean, default: false },
    banned: { type: Boolean, default: false, index: true },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre('save', function syncAdminFlag() {
  this.isAdmin = this.role === 'admin';
});

userSchema.methods.isVipActive = function isVipActive() {
  if (!this.isVip) return false;
  if (this.isUnlimitedVip) return true;
  if (!this.vipExpiresAt) return true;
  return this.vipExpiresAt.getTime() > Date.now();
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
