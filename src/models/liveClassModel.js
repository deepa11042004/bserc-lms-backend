const { lmsDB } = require('../config/db');

async function findById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, title, description, instructor_name, platform, meeting_link,
            meeting_id, meeting_password, scheduled_at, duration_minutes,
            notes, is_active, created_at, updated_at
     FROM live_classes WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listAll({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await lmsDB.query(
    `SELECT id, title, description, instructor_name, platform, meeting_link,
            meeting_id, meeting_password, scheduled_at, duration_minutes,
            notes, is_active, created_at, updated_at
     FROM live_classes
     ${where}
     ORDER BY scheduled_at ASC`
  );
  return rows;
}

async function create({ title, description, instructor_name, platform, meeting_link, meeting_id, meeting_password, scheduled_at, duration_minutes, notes, is_active }) {
  const [result] = await lmsDB.query(
    `INSERT INTO live_classes
       (title, description, instructor_name, platform, meeting_link, meeting_id, meeting_password, scheduled_at, duration_minutes, notes, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || null,
      instructor_name || null,
      platform || 'Zoom',
      meeting_link,
      meeting_id || null,
      meeting_password || null,
      scheduled_at,
      duration_minutes || 60,
      notes || null,
      is_active === undefined ? 1 : (is_active ? 1 : 0),
    ]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const cols = [];
  const vals = [];

  if (fields.title !== undefined)            { cols.push('title = ?');            vals.push(fields.title); }
  if (fields.description !== undefined)      { cols.push('description = ?');      vals.push(fields.description || null); }
  if (fields.instructor_name !== undefined)  { cols.push('instructor_name = ?');  vals.push(fields.instructor_name || null); }
  if (fields.platform !== undefined)         { cols.push('platform = ?');         vals.push(fields.platform); }
  if (fields.meeting_link !== undefined)     { cols.push('meeting_link = ?');     vals.push(fields.meeting_link); }
  if (fields.meeting_id !== undefined)       { cols.push('meeting_id = ?');       vals.push(fields.meeting_id || null); }
  if (fields.meeting_password !== undefined) { cols.push('meeting_password = ?'); vals.push(fields.meeting_password || null); }
  if (fields.scheduled_at !== undefined)     { cols.push('scheduled_at = ?');     vals.push(fields.scheduled_at); }
  if (fields.duration_minutes !== undefined) { cols.push('duration_minutes = ?'); vals.push(fields.duration_minutes); }
  if (fields.notes !== undefined)            { cols.push('notes = ?');            vals.push(fields.notes || null); }
  if (fields.is_active !== undefined)        { cols.push('is_active = ?');        vals.push(fields.is_active ? 1 : 0); }

  if (!cols.length) return findById(id);

  vals.push(id);
  await lmsDB.query(`UPDATE live_classes SET ${cols.join(', ')} WHERE id = ?`, vals);
  return findById(id);
}

async function remove(id) {
  const [result] = await lmsDB.query(`DELETE FROM live_classes WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, listAll, create, update, remove };
