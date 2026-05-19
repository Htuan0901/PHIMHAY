const { getSettings, updateSettings, sanitizeSettings } = require('../services/settingsService');
const { logActivity } = require('../services/activityLogService');

exports.getSettings = async (req, res, next) => {
  try {
    const doc = await getSettings();
    res.json({ settings: sanitizeSettings(doc) });
  } catch (e) {
    next(e);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const current = await getSettings();
    const body = { ...req.body };

    if (body.emailConfig?.password === '••••••••' || body.emailConfig?.password === '') {
      delete body.emailConfig.password;
    }
    if (body.thirdPartyAPIKeys) {
      for (const key of Object.keys(body.thirdPartyAPIKeys)) {
        if (body.thirdPartyAPIKeys[key] === '••••••••') {
          body.thirdPartyAPIKeys[key] = current.thirdPartyAPIKeys?.[key] || '';
        }
      }
    }

    const doc = await updateSettings(body);
    await logActivity(req, {
      action: 'admin.settings.update',
      targetType: 'settings',
      targetId: 'global',
      metadata: { fields: Object.keys(req.body) }
    });
    res.json({ settings: sanitizeSettings(doc) });
  } catch (e) {
    next(e);
  }
};

exports.getPublicSettings = async (req, res, next) => {
  try {
    const doc = await getSettings();
    res.json({
      siteName: doc.siteName,
      logo: doc.logo,
      bannerImages: doc.bannerImages,
      maintenanceMode: doc.maintenanceMode,
      registrationEnabled: doc.registrationEnabled,
      commentsEnabled: doc.commentsEnabled
    });
  } catch (e) {
    next(e);
  }
};
