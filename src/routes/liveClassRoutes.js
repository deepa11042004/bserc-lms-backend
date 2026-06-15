const express = require('express');
const controller = require('../controllers/liveClassController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');

const router = express.Router();

// Public: active live classes visible to students
router.get('/live-classes', controller.listPublic);

// Admin: all live classes (including inactive)
router.get(
  '/admin/live-classes',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.listAdmin
);

// Admin: create
router.post(
  '/admin/live-classes',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.create
);

// Admin: update
router.put(
  '/admin/live-classes/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.update
);

// Admin: delete
router.delete(
  '/admin/live-classes/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.remove
);

module.exports = router;
