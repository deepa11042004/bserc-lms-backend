const { lmsDB } = require('../config/db');

async function findById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, category, topic, file_url, s3_key, original_name, file_size, mime_type, display_order
     FROM assignment_entries WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listAll() {
  const [rows] = await lmsDB.query(
    `SELECT id, category, topic, file_url, s3_key, original_name, file_size, mime_type, display_order
     FROM assignment_entries
     ORDER BY display_order ASC, id ASC`
  );
  return rows;
}

async function create({ category, topic, file_url, s3_key, original_name, file_size, mime_type, display_order }) {
  const [result] = await lmsDB.query(
    `INSERT INTO assignment_entries (category, topic, file_url, s3_key, original_name, file_size, mime_type, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [category || null, topic, file_url, s3_key || null, original_name || null, file_size || null, mime_type || null, display_order || 0]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const cols = [], vals = [];
  if (fields.category   !== undefined) { cols.push('category = ?');   vals.push(fields.category || null); }
  if (fields.topic      !== undefined) { cols.push('topic = ?');      vals.push(fields.topic); }
  if (fields.display_order !== undefined) { cols.push('display_order = ?'); vals.push(fields.display_order); }
  if (!cols.length) return findById(id);
  vals.push(id);
  await lmsDB.query(`UPDATE assignment_entries SET ${cols.join(', ')} WHERE id = ?`, vals);
  return findById(id);
}

async function remove(id) {
  const [result] = await lmsDB.query(`DELETE FROM assignment_entries WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, listAll, create, update, remove };
