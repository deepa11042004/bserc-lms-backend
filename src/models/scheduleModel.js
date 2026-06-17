const { lmsDB } = require('../config/db');

async function findById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, session_date, session_time, subject, topic, display_order FROM schedule_entries WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listAll() {
  const [rows] = await lmsDB.query(
    `SELECT id, session_date, session_time, subject, topic, display_order
     FROM schedule_entries
     ORDER BY display_order ASC, session_date ASC, id ASC`
  );
  return rows;
}

async function create({ session_date, session_time, subject, topic, display_order }) {
  const [result] = await lmsDB.query(
    `INSERT INTO schedule_entries (session_date, session_time, subject, topic, display_order) VALUES (?, ?, ?, ?, ?)`,
    [session_date, session_time || null, subject, topic, display_order || 0]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const cols = [], vals = [];
  if (fields.session_date !== undefined)  { cols.push('session_date = ?');  vals.push(fields.session_date); }
  if (fields.session_time !== undefined)  { cols.push('session_time = ?');  vals.push(fields.session_time); }
  if (fields.subject !== undefined)       { cols.push('subject = ?');       vals.push(fields.subject); }
  if (fields.topic !== undefined)         { cols.push('topic = ?');         vals.push(fields.topic); }
  if (fields.display_order !== undefined) { cols.push('display_order = ?'); vals.push(fields.display_order); }
  if (!cols.length) return findById(id);
  vals.push(id);
  await lmsDB.query(`UPDATE schedule_entries SET ${cols.join(', ')} WHERE id = ?`, vals);
  return findById(id);
}

async function remove(id) {
  const [result] = await lmsDB.query(`DELETE FROM schedule_entries WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { listAll, findById, create, update, remove };
