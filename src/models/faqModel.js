const { lmsDB } = require('../config/db');

async function listFaqs({ includeUnpublished = false } = {}) {
  const whereClause = includeUnpublished ? '' : 'WHERE is_published = 1';
  const [rows] = await lmsDB.query(
    `SELECT id, question, answer, display_order, is_published, created_at, updated_at
     FROM faqs
     ${whereClause}
     ORDER BY display_order ASC, id ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await lmsDB.query(
    `SELECT id, question, answer, display_order, is_published, created_at, updated_at
     FROM faqs WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function createFaq({ question, answer, display_order = 0, is_published = 1 }) {
  const [result] = await lmsDB.query(
    `INSERT INTO faqs (question, answer, display_order, is_published) VALUES (?, ?, ?, ?)`,
    [question, answer, display_order, is_published ? 1 : 0]
  );
  return findById(result.insertId);
}

async function updateFaq(id, { question, answer, display_order, is_published }) {
  const fields = [];
  const values = [];

  if (question !== undefined) { fields.push('question = ?'); values.push(question); }
  if (answer !== undefined) { fields.push('answer = ?'); values.push(answer); }
  if (display_order !== undefined) { fields.push('display_order = ?'); values.push(display_order); }
  if (is_published !== undefined) { fields.push('is_published = ?'); values.push(is_published ? 1 : 0); }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await lmsDB.query(`UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function deleteFaq(id) {
  const [result] = await lmsDB.query(`DELETE FROM faqs WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { listFaqs, findById, createFaq, updateFaq, deleteFaq };
