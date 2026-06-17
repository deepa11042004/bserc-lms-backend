const express = require('express');
const controller = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');

const router = express.Router();

router.get('/announcements', controller.listActive);

router.get('/admin/announcements', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.listAll);
router.post('/admin/announcements', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.create);
router.put('/admin/announcements/:id', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.update);
router.delete('/admin/announcements/:id', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.remove);

module.exports = router;
