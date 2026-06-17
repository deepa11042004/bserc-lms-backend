const { lmsDB } = require('../config/db');

async function findById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, title, body, type, is_active, created_at, updated_at FROM announcements WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listAll() {
  const [rows] = await lmsDB.query(
    `SELECT id, title, body, type, is_active, created_at, updated_at
     FROM announcements
     ORDER BY created_at DESC`
  );
  return rows;
}

async function listActive() {
  const [rows] = await lmsDB.query(
    `SELECT id, title, body, type, created_at
     FROM announcements
     WHERE is_active = 1
     ORDER BY created_at DESC`
  );
  return rows;
}

async function create({ title, body, type, is_active }) {
  const [result] = await lmsDB.query(
    `INSERT INTO announcements (title, body, type, is_active) VALUES (?, ?, ?, ?)`,
    [title, body, type || 'info', is_active !== undefined ? is_active : 1]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const cols = [], vals = [];
  if (fields.title !== undefined)     { cols.push('title = ?');     vals.push(fields.title); }
  if (fields.body !== undefined)      { cols.push('body = ?');      vals.push(fields.body); }
  if (fields.type !== undefined)      { cols.push('type = ?');      vals.push(fields.type); }
  if (fields.is_active !== undefined) { cols.push('is_active = ?'); vals.push(fields.is_active); }
  if (!cols.length) return findById(id);
  vals.push(id);
  await lmsDB.query(`UPDATE announcements SET ${cols.join(', ')} WHERE id = ?`, vals);
  return findById(id);
}

async function remove(id) {
  const [result] = await lmsDB.query(`DELETE FROM announcements WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { listAll, listActive, findById, create, update, remove };
