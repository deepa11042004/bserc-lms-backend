const reviewService = require('../services/reviewService');

async function getCourseReviews(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId) || courseId < 1) {
      return res.status(400).json({ message: 'Invalid course id.' });
    }
    const userId = req.user?.userId || null;
    const result = await reviewService.getCourseReviews(courseId, userId);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Get course reviews error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function submitReview(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId) || courseId < 1) {
      return res.status(400).json({ message: 'Invalid course id.' });
    }
    const result = await reviewService.submitReview(req.user.userId, courseId, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Submit review error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function adminListReviews(req, res) {
  try {
    const { status } = req.query;
    const result = await reviewService.adminListReviews({ status });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Admin list reviews error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function adminUpdateReview(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid review id.' });
    }
    const result = await reviewService.adminUpdateReview(id, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Admin update review error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function adminDeleteReview(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid review id.' });
    }
    const result = await reviewService.adminDeleteReview(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Admin delete review error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getCourseReviews, submitReview, adminListReviews, adminUpdateReview, adminDeleteReview };
