const { lmsDB } = require('../config/db');

async function listByCourse(courseId) {
  const [rows] = await lmsDB.query(
    `SELECT id, course_id, title, resource_type, url, s3_key, file_size, mime_type, original_name, display_order, created_at, updated_at
     FROM course_resources
     WHERE course_id = ?
     ORDER BY display_order ASC, id ASC`,
    [courseId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, course_id, title, resource_type, url, s3_key, file_size, mime_type, original_name, display_order, created_at, updated_at
     FROM course_resources WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ course_id, title, resource_type, url, s3_key, file_size, mime_type, original_name, display_order }) {
  const [result] = await lmsDB.query(
    `INSERT INTO course_resources
       (course_id, title, resource_type, url, s3_key, file_size, mime_type, original_name, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [course_id, title, resource_type, url, s3_key || null, file_size || null, mime_type || null, original_name || null, display_order || 0]
  );
  return findById(result.insertId);
}

async function remove(id) {
  const [result] = await lmsDB.query(`DELETE FROM course_resources WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { listByCourse, findById, create, remove };
