const express = require('express');
const controller = require('../controllers/recordedClassController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');

const router = express.Router();

// Public: published courses + classes for students
router.get('/recorded-classes', controller.listPublicCourses);

// Admin: all (including unpublished drafts)
router.get(
  '/admin/recorded-classes',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.listAdminCourses
);

// Admin: course group CRUD
router.post(
  '/admin/recorded-class-courses',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.createCourse
);

router.put(
  '/admin/recorded-class-courses/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.updateCourse
);

router.delete(
  '/admin/recorded-class-courses/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.deleteCourse
);

// Admin: individual class CRUD
router.post(
  '/admin/recorded-classes',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.createClass
);

router.put(
  '/admin/recorded-classes/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.updateClass
);

router.delete(
  '/admin/recorded-classes/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  controller.deleteClass
);

module.exports = router;
