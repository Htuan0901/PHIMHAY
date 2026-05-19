const Joi = require('joi');

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('').optional(),
  role: Joi.string().valid('user', 'moderator', 'admin').optional(),
  vip: Joi.string().valid('true', 'false', 'unlimited', 'expired').optional(),
  banned: Joi.string().valid('true', 'false').optional()
});

const setRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'moderator', 'admin').required()
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(128).required()
});

const vipUpdateSchema = Joi.object({
  isVip: Joi.boolean().optional(),
  vipExpireAt: Joi.date().iso().allow(null).optional(),
  addDays: Joi.number().integer().min(1).max(3650).optional(),
  enableUnlimited: Joi.boolean().optional(),
  removeVip: Joi.boolean().optional()
}).or('isVip', 'vipExpireAt', 'addDays', 'enableUnlimited', 'removeVip');

const settingsUpdateSchema = Joi.object({
  siteName: Joi.string().max(120).optional(),
  logo: Joi.string().max(2_000_000).allow('').optional(),
  bannerImages: Joi.array().items(Joi.string().max(2_000_000)).max(20).optional(),
  maintenanceMode: Joi.boolean().optional(),
  registrationEnabled: Joi.boolean().optional(),
  commentsEnabled: Joi.boolean().optional(),
  emailConfig: Joi.object({
    host: Joi.string().allow('').optional(),
    port: Joi.number().optional(),
    user: Joi.string().allow('').optional(),
    password: Joi.string().allow('').optional(),
    from: Joi.string().allow('').optional()
  }).optional(),
  thirdPartyAPIKeys: Joi.object({
    phimapi: Joi.string().allow('').optional(),
    vnpay: Joi.string().allow('').optional()
  }).optional()
});

const listLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(30),
  action: Joi.string().allow('').optional(),
  targetType: Joi.string().allow('').optional(),
  actorId: Joi.string().hex().length(24).optional(),
  search: Joi.string().allow('').optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional()
});

module.exports = {
  listUsersQuerySchema,
  setRoleSchema,
  resetPasswordSchema,
  vipUpdateSchema,
  settingsUpdateSchema,
  listLogsQuerySchema
};
