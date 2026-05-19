const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    siteName: { type: String, default: 'PHIMHAY' },
    logo: { type: String, default: '' },
    bannerImages: { type: [String], default: [] },
    maintenanceMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    commentsEnabled: { type: Boolean, default: true },
    emailConfig: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      user: { type: String, default: '' },
      password: { type: String, default: '' },
      from: { type: String, default: '' }
    },
    thirdPartyAPIKeys: {
      phimapi: { type: String, default: '' },
      vnpay: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
