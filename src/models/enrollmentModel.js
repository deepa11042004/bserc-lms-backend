const { lmsDB } = require('../config/db');

const BASE_SELECT = `SELECT
  id,
  user_id,
  course_id,
  status,
  enrolled_at,
  created_at,
  updated_at
 FROM enrollments`;

async function findById(id, runner = lmsDB, options = {}) {
  const forUpdateClause = options.forUpdate ? ' FOR UPDATE' : '';

  const [rows] = await runner.query(
    `${BASE_SELECT}
     WHERE id = ?
     LIMIT 1${forUpdateClause}`,
    [id]
  );

  return rows[0] || null;
}

async function findByUserAndCourse(userId, courseId, runner = lmsDB, options = {}) {
  const forUpdateClause = options.forUpdate ? ' FOR UPDATE' : '';

  const [rows] = await runner.query(
    `${BASE_SELECT}
     WHERE user_id = ? AND course_id = ?
     LIMIT 1${forUpdateClause}`,
    [userId, courseId]
  );

  return rows[0] || null;
}

async function createEnrollment(payload, runner = lmsDB) {
  const [result] = await runner.query(
    `INSERT INTO enrollments (
      user_id,
      course_id,
      status,
      enrolled_at
    ) VALUES (?, ?, ?, ?)`,
    [
      payload.user_id,
      payload.course_id,
      payload.status || 'active',
      payload.enrolled_at || new Date(),
    ]
  );

  return result.insertId;
}

async function updateStatusById(enrollmentId, status, runner = lmsDB) {
  const [result] = await runner.query(
    `UPDATE enrollments
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, enrollmentId]
  );

  return result.affectedRows;
}

async function reactivateById(enrollmentId, runner = lmsDB) {
  const [result] = await runner.query(
    `UPDATE enrollments
     SET
       status = 'active',
       enrolled_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [enrollmentId]
  );

  return result.affectedRows;
}

async function listByUserWithCourses(userId, statuses = ['active', 'completed'], runner = lmsDB) {
  const normalizedStatuses = Array.isArray(statuses)
    ? statuses.map((status) => String(status || '').trim().toLowerCase()).filter(Boolean)
    : [];

  if (!normalizedStatuses.length) {
    return [];
  }

  const placeholders = normalizedStatuses.map(() => '?').join(', ');

  const [rows] = await runner.query(
    `SELECT
      e.id,
      e.user_id,
      e.course_id,
      e.status,
      e.enrolled_at,
      e.created_at,
      e.updated_at,
      c.title,
      c.slug,
      c.subtitle,
      c.description,
      c.category,
      c.level,
      c.language,
      c.thumbnail,
      c.price,
      c.discount_price,
      c.currency,
      c.is_free,
      c.is_paid,
      c.lifetime_access,
      c.certificate_available,
      c.is_published,
      c.instructor_id,
      c.total_duration_minutes,
      c.enrolled_students,
      c.created_at AS course_created_at,
      c.updated_at AS course_updated_at
     FROM enrollments e
     INNER JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = ?
       AND e.status IN (${placeholders})
     ORDER BY e.enrolled_at DESC, e.id DESC`,
    [userId, ...normalizedStatuses]
  );

  return rows;
}

module.exports = {
  findById,
  findByUserAndCourse,
  createEnrollment,
  updateStatusById,
  reactivateById,
  listByUserWithCourses,
};