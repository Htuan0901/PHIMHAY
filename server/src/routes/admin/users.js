const express = require('express');
const { validate } = require('../../middleware/validate');
const {
  listUsersQuerySchema,
  setRoleSchema,
  resetPasswordSchema,
  vipUpdateSchema
} = require('../../validators/adminValidators');
const adminUsersController = require('../../controllers/adminUsersController');

const router = express.Router();

router.get('/', validate(listUsersQuerySchema, 'query'), adminUsersController.listUsers);
router.get('/:id', adminUsersController.getUser);
router.patch('/:id/ban', adminUsersController.banUser);
router.patch('/:id/unban', adminUsersController.unbanUser);
router.delete('/:id', adminUsersController.deleteUser);
router.post('/:id/reset-password', validate(resetPasswordSchema), adminUsersController.resetPassword);
router.patch('/:id/role', validate(setRoleSchema), adminUsersController.setRole);
router.patch('/:id/vip', validate(vipUpdateSchema), adminUsersController.updateVip);

module.exports = router;
