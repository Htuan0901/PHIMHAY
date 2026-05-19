const ActivityLog = require('../models/ActivityLog');
const { getClientIp, getActorRole } = require('../utils/requestMeta');

/**
 * Fire-and-forget activity log — never blocks the main request on failure.
 */
async function logActivity(req, { action, targetType = '', targetId = '', metadata = {} }) {
  try {
    const actor = req.user || null;
    await ActivityLog.create({
      actorId: actor?._id || null,
      actorRole: getActorRole(actor),
      action,
      targetType,
      targetId: targetId ? String(targetId) : '',
      metadata,
      ipAddress: getClientIp(req)
    });
  } catch (err) {
    console.error('[ActivityLog]', err.message);
  }
}

module.exports = { logActivity };
