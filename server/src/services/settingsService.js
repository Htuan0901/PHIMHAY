const SystemSettings = require('../models/SystemSettings');

const GLOBAL_KEY = 'global';

async function getSettings() {
  let doc = await SystemSettings.findOne({ key: GLOBAL_KEY });
  if (!doc) {
    doc = await SystemSettings.create({ key: GLOBAL_KEY });
  }
  return doc;
}

async function updateSettings(updates) {
  const doc = await getSettings();
  const allowed = [
    'siteName',
    'logo',
    'bannerImages',
    'maintenanceMode',
    'registrationEnabled',
    'commentsEnabled',
    'emailConfig',
    'thirdPartyAPIKeys'
  ];
  for (const field of allowed) {
    if (updates[field] !== undefined) {
      doc[field] = updates[field];
    }
  }
  await doc.save();
  return doc;
}

function sanitizeSettings(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj.emailConfig?.password) {
    obj.emailConfig = { ...obj.emailConfig, password: obj.emailConfig.password ? '••••••••' : '' };
  }
  if (obj.thirdPartyAPIKeys) {
    const keys = { ...obj.thirdPartyAPIKeys };
    for (const k of Object.keys(keys)) {
      if (keys[k]) keys[k] = '••••••••';
    }
    obj.thirdPartyAPIKeys = keys;
  }
  delete obj.__v;
  return obj;
}

module.exports = { getSettings, updateSettings, sanitizeSettings, GLOBAL_KEY };
