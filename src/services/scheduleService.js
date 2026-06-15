const scheduleModel = require('../models/scheduleModel');

const trim = (v = '') => String(v ?? '').trim();

async function listAll() {
  const entries = await scheduleModel.listAll();
  return { status: 200, body: { entries } };
}

async function create(payload) {
  const subject = trim(payload.subject);
  const topic   = trim(payload.topic);
  if (!subject)           return { status: 400, body: { message: 'Subject is required.' } };
  if (!topic)             return { status: 400, body: { message: 'Topic is required.' } };
  if (!payload.session_date) return { status: 400, body: { message: 'Date is required.' } };

  const entry = await scheduleModel.create({
    day_number:    Number(payload.day_number) || 1,
    session_date:  payload.session_date,
    subject,
    topic,
    display_order: Number(payload.display_order) || 0,
  });
  return { status: 201, body: { entry } };
}

async function update(id, payload) {
  const existing = await scheduleModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Entry not found.' } };

  const updates = {};
  if (payload.day_number !== undefined)   updates.day_number = Number(payload.day_number) || 1;
  if (payload.session_date !== undefined) updates.session_date = payload.session_date;
  if (payload.subject !== undefined) {
    const subject = trim(payload.subject);
    if (!subject) return { status: 400, body: { message: 'Subject is required.' } };
    updates.subject = subject;
  }
  if (payload.topic !== undefined) {
    const topic = trim(payload.topic);
    if (!topic) return { status: 400, body: { message: 'Topic is required.' } };
    updates.topic = topic;
  }
  if (payload.display_order !== undefined) updates.display_order = Number(payload.display_order) || 0;

  const entry = await scheduleModel.update(id, updates);
  return { status: 200, body: { entry } };
}

async function remove(id) {
  const existing = await scheduleModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Entry not found.' } };
  await scheduleModel.remove(id);
  return { status: 200, body: { message: 'Entry deleted.' } };
}

module.exports = { listAll, create, update, remove };
