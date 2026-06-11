const express = require('express');
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');

const router = express.Router();

// Public — returns only published FAQs
router.get('/faqs', faqController.listPublicFaqs);

// Admin — full CRUD, requires admin/super_admin/instructor role
router.get(
  '/admin/faqs',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  faqController.listAdminFaqs
);

router.post(
  '/admin/faqs',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  faqController.createFaq
);

router.put(
  '/admin/faqs/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  faqController.updateFaq
);

router.delete(
  '/admin/faqs/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  faqController.deleteFaq
);

module.exports = router;
