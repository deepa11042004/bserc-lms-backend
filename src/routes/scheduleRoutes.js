const express = require('express');
const controller = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');

const router = express.Router();

router.get('/schedule', controller.listAll);

router.post('/admin/schedule', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.create);
router.put('/admin/schedule/:id', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.update);
router.delete('/admin/schedule/:id', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.remove);

module.exports = router;
