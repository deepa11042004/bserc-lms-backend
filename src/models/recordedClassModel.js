const { lmsDB } = require('../config/db');

// ── Course groups (e.g. "Advance Drone Technology") ──────────────────────────

async function listCoursesWithClasses({ includeUnpublished = false } = {}) {
  const courseWhere = includeUnpublished ? '' : 'WHERE is_published = 1';
  const classWhere = includeUnpublished ? '' : 'AND cl.is_published = 1';

  const [courses] = await lmsDB.query(
    `SELECT id, title, display_order, is_published, created_at, updated_at
     FROM recorded_class_courses
     ${courseWhere}
     ORDER BY display_order ASC, id ASC`
  );

  if (!courses.length) return [];

  const courseIds = courses.map((c) => c.id);
  const [classes] = await lmsDB.query(
    `SELECT id, course_id, title, video_url, resource_url, display_order, is_published, created_at, updated_at
     FROM recorded_classes cl
     WHERE course_id IN (?) ${classWhere}
     ORDER BY display_order ASC, id ASC`,
    [courseIds]
  );

  const classMap = {};
  for (const cls of classes) {
    if (!classMap[cls.course_id]) classMap[cls.course_id] = [];
    classMap[cls.course_id].push(cls);
  }

  return courses.map((course) => ({ ...course, classes: classMap[course.id] || [] }));
}

async function findCourseById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, title, display_order, is_published, created_at, updated_at
     FROM recorded_class_courses WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function createCourse({ title, display_order = 0, is_published = 1 }) {
  const [result] = await lmsDB.query(
    `INSERT INTO recorded_class_courses (title, display_order, is_published) VALUES (?, ?, ?)`,
    [title, display_order, is_published ? 1 : 0]
  );
  return findCourseById(result.insertId);
}

async function updateCourse(id, { title, display_order, is_published }) {
  const fields = [];
  const values = [];
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (display_order !== undefined) { fields.push('display_order = ?'); values.push(display_order); }
  if (is_published !== undefined) { fields.push('is_published = ?'); values.push(is_published ? 1 : 0); }
  if (!fields.length) return findCourseById(id);
  values.push(id);
  await lmsDB.query(`UPDATE recorded_class_courses SET ${fields.join(', ')} WHERE id = ?`, values);
  return findCourseById(id);
}

async function deleteCourse(id) {
  const [result] = await lmsDB.query(`DELETE FROM recorded_class_courses WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

// ── Individual classes / lectures ─────────────────────────────────────────────

async function findClassById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, course_id, title, video_url, resource_url, display_order, is_published, created_at, updated_at
     FROM recorded_classes WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function createClass({ course_id, title, video_url = null, resource_url = null, display_order = 0, is_published = 1 }) {
  const [result] = await lmsDB.query(
    `INSERT INTO recorded_classes (course_id, title, video_url, resource_url, display_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [course_id, title, video_url || null, resource_url || null, display_order, is_published ? 1 : 0]
  );
  return findClassById(result.insertId);
}

async function updateClass(id, { title, video_url, resource_url, display_order, is_published }) {
  const fields = [];
  const values = [];
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (video_url !== undefined) { fields.push('video_url = ?'); values.push(video_url || null); }
  if (resource_url !== undefined) { fields.push('resource_url = ?'); values.push(resource_url || null); }
  if (display_order !== undefined) { fields.push('display_order = ?'); values.push(display_order); }
  if (is_published !== undefined) { fields.push('is_published = ?'); values.push(is_published ? 1 : 0); }
  if (!fields.length) return findClassById(id);
  values.push(id);
  await lmsDB.query(`UPDATE recorded_classes SET ${fields.join(', ')} WHERE id = ?`, values);
  return findClassById(id);
}

async function deleteClass(id) {
  const [result] = await lmsDB.query(`DELETE FROM recorded_classes WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listCoursesWithClasses,
  findCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  findClassById,
  createClass,
  updateClass,
  deleteClass,
};
