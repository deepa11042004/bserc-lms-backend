const { lmsDB } = require('../config/db');
const { authDB } = require('../config/db');

const BASE_SELECT = `
  SELECT
    cr.id,
    cr.user_id,
    cr.course_id,
    cr.rating,
    cr.comment,
    cr.status,
    cr.admin_reply,
    cr.created_at,
    cr.updated_at,
    u.full_name AS user_name,
    c.title AS course_title
  FROM course_reviews cr
  LEFT JOIN bserc_core_db.users u ON u.id = cr.user_id
  LEFT JOIN courses c ON c.id = cr.course_id
`;

async function findById(id) {
  const [rows] = await lmsDB.query(`${BASE_SELECT} WHERE cr.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findByUserAndCourse(userId, courseId) {
  const [rows] = await lmsDB.query(
    `${BASE_SELECT} WHERE cr.user_id = ? AND cr.course_id = ? LIMIT 1`,
    [userId, courseId]
  );
  return rows[0] || null;
}

async function listByCourse(courseId, { includeAll = false } = {}) {
  const where = includeAll
    ? 'WHERE cr.course_id = ?'
    : "WHERE cr.course_id = ? AND cr.status = 'approved'";
  const [rows] = await lmsDB.query(
    `${BASE_SELECT} ${where} ORDER BY cr.created_at DESC`,
    [courseId]
  );
  return rows;
}

async function listAll({ status } = {}) {
  const where = status ? 'WHERE cr.status = ?' : '';
  const params = status ? [status] : [];
  const [rows] = await lmsDB.query(
    `${BASE_SELECT} ${where} ORDER BY cr.created_at DESC`,
    params
  );
  return rows;
}

async function createReview({ user_id, course_id, rating, comment }) {
  const [result] = await lmsDB.query(
    `INSERT INTO course_reviews (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)`,
    [user_id, course_id, rating, comment || null]
  );
  return findById(result.insertId);
}

async function updateReview(id, updates) {
  const fields = [];
  const values = [];

  if (updates.rating !== undefined) { fields.push('rating = ?'); values.push(updates.rating); }
  if (updates.comment !== undefined) { fields.push('comment = ?'); values.push(updates.comment || null); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.admin_reply !== undefined) { fields.push('admin_reply = ?'); values.push(updates.admin_reply || null); }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await lmsDB.query(`UPDATE course_reviews SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function deleteReview(id) {
  const [result] = await lmsDB.query(`DELETE FROM course_reviews WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, findByUserAndCourse, listByCourse, listAll, createReview, updateReview, deleteReview };
