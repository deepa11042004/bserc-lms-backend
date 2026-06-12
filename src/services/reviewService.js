const reviewModel = require('../models/reviewModel');
const enrollmentModel = require('../models/enrollmentModel');

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'hidden'];

async function getCourseReviews(courseId, requestingUserId) {
  const approved = await reviewModel.listByCourse(courseId, { includeAll: false });
  let myReview = null;
  if (requestingUserId) {
    myReview = await reviewModel.findByUserAndCourse(requestingUserId, courseId);
  }
  return { status: 200, body: { reviews: approved, myReview } };
}

async function submitReview(userId, courseId, payload) {
  const enrollment = await enrollmentModel.findByUserAndCourse(userId, courseId);
  if (!enrollment) {
    return { status: 403, body: { message: 'You must be enrolled in this course to leave a review.' } };
  }

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: 400, body: { message: 'Rating must be a whole number between 1 and 5.' } };
  }

  const comment = String(payload.comment || '').trim();
  if (comment.length > 1000) {
    return { status: 400, body: { message: 'Comment must be 1000 characters or fewer.' } };
  }

  const existing = await reviewModel.findByUserAndCourse(userId, courseId);
  if (existing) {
    const updated = await reviewModel.updateReview(existing.id, { rating, comment, status: 'pending' });
    return { status: 200, body: { review: updated } };
  }

  const review = await reviewModel.createReview({ user_id: userId, course_id: courseId, rating, comment });
  return { status: 201, body: { review } };
}

async function adminListReviews({ status } = {}) {
  if (status && !VALID_STATUSES.includes(status)) {
    return { status: 400, body: { message: 'Invalid status filter.' } };
  }
  const reviews = await reviewModel.listAll({ status });
  return { status: 200, body: { reviews } };
}

async function adminUpdateReview(reviewId, payload) {
  const existing = await reviewModel.findById(reviewId);
  if (!existing) return { status: 404, body: { message: 'Review not found.' } };

  const updates = {};
  if (payload.status !== undefined) {
    if (!VALID_STATUSES.includes(payload.status)) {
      return { status: 400, body: { message: 'Invalid status.' } };
    }
    updates.status = payload.status;
  }
  if (payload.admin_reply !== undefined) {
    updates.admin_reply = String(payload.admin_reply || '').trim() || null;
  }

  const review = await reviewModel.updateReview(reviewId, updates);
  return { status: 200, body: { review } };
}

async function adminDeleteReview(reviewId) {
  const existing = await reviewModel.findById(reviewId);
  if (!existing) return { status: 404, body: { message: 'Review not found.' } };
  await reviewModel.deleteReview(reviewId);
  return { status: 200, body: { message: 'Review deleted.' } };
}

module.exports = { getCourseReviews, submitReview, adminListReviews, adminUpdateReview, adminDeleteReview };
