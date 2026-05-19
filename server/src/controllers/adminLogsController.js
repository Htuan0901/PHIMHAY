const ActivityLog = require('../models/ActivityLog');

exports.listLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action, targetType, actorId, search, from, to } = req.query;
    const q = {};

    if (action) q.action = new RegExp(String(action).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (targetType) q.targetType = targetType;
    if (actorId) q.actorId = actorId;

    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    if (search) {
      q.$or = [
        { action: new RegExp(search, 'i') },
        { targetId: new RegExp(search, 'i') },
        { ipAddress: new RegExp(search, 'i') }
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const [items, total] = await Promise.all([
      ActivityLog.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actorId', 'displayName email role')
        .lean(),
      ActivityLog.countDocuments(q)
    ]);

    res.json({
      items: items.map((log) => ({
        id: log._id,
        actorId: log.actorId?._id || log.actorId,
        actorName: log.actorId?.displayName || null,
        actorEmail: log.actorId?.email || null,
        actorRole: log.actorRole,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt
      })),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) || 1 }
    });
  } catch (e) {
    next(e);
  }
};
