const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');

const router = express.Router();

// ── User-facing: get reviews for a course (public, but also returns myReview if authenticated) ──
router.get('/courses/:courseId/reviews', optionalAuthMiddleware, reviewController.getCourseReviews);

// ── User-facing: submit or update own review (must be enrolled) ──
router.post('/courses/:courseId/reviews', authMiddleware, reviewController.submitReview);

// ── Admin: list all reviews with optional ?status= filter ──
router.get(
  '/admin/reviews',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  reviewController.adminListReviews
);

// ── Admin: approve / reject / hide + add reply ──
router.put(
  '/admin/reviews/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  reviewController.adminUpdateReview
);

// ── Admin: delete a review ──
router.delete(
  '/admin/reviews/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  reviewController.adminDeleteReview
);

module.exports = router;
