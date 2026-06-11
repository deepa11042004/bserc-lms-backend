const express = require('express');
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');

const router = express.Router();

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: List all published FAQs
 *     description: Retrieve all published FAQs visible to students. Does not require authentication.
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: List of published FAQs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 faqs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       question:
 *                         type: string
 *                       answer:
 *                         type: string
 *                       display_order:
 *                         type: integer
 *                       is_published:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/faqs', faqController.listPublicFaqs);

/**
 * @swagger
 * /api/admin/faqs:
 *   get:
 *     summary: List all FAQs (admin)
 *     description: Retrieve all FAQs including drafts. Requires admin, super_admin, or instructor role.
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all FAQs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new FAQ
 *     description: Create a new FAQ. Requires admin, super_admin, or instructor role.
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer]
 *             properties:
 *               question:
 *                 type: string
 *                 description: The FAQ question
 *               answer:
 *                 type: string
 *                 description: The FAQ answer
 *               display_order:
 *                 type: integer
 *                 default: 0
 *                 description: Order in which FAQs appear
 *               is_published:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the FAQ is visible to students
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/admin/faqs/{id}:
 *   put:
 *     summary: Update an FAQ
 *     description: Update an existing FAQ. Requires admin, super_admin, or instructor role.
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               display_order:
 *                 type: integer
 *               is_published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an FAQ
 *     description: Delete an existing FAQ. Requires admin, super_admin, or instructor role.
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ ID
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Internal server error
 */
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
