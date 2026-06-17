const announcementModel = require('../models/announcementModel');

const trim = (v = '') => String(v ?? '').trim();
const VALID_TYPES = ['info', 'warning', 'success', 'urgent'];

async function listAll() {
  const announcements = await announcementModel.listAll();
  return { status: 200, body: { announcements } };
}

async function listActive() {
  const announcements = await announcementModel.listActive();
  return { status: 200, body: { announcements } };
}

async function create(payload) {
  const title = trim(payload.title);
  const body  = trim(payload.body);
  if (!title) return { status: 400, body: { message: 'Title is required.' } };
  if (!body)  return { status: 400, body: { message: 'Body is required.' } };
  const type = VALID_TYPES.includes(payload.type) ? payload.type : 'info';

  const announcement = await announcementModel.create({
    title,
    body,
    type,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
  });
  return { status: 201, body: { announcement } };
}

async function update(id, payload) {
  const existing = await announcementModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Announcement not found.' } };

  const updates = {};
  if (payload.title !== undefined) {
    const title = trim(payload.title);
    if (!title) return { status: 400, body: { message: 'Title is required.' } };
    updates.title = title;
  }
  if (payload.body !== undefined) {
    const body = trim(payload.body);
    if (!body) return { status: 400, body: { message: 'Body is required.' } };
    updates.body = body;
  }
  if (payload.type !== undefined) {
    if (!VALID_TYPES.includes(payload.type)) return { status: 400, body: { message: 'Invalid type.' } };
    updates.type = payload.type;
  }
  if (payload.is_active !== undefined) updates.is_active = Boolean(payload.is_active);

  const announcement = await announcementModel.update(id, updates);
  return { status: 200, body: { announcement } };
}

async function remove(id) {
  const existing = await announcementModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Announcement not found.' } };
  await announcementModel.remove(id);
  return { status: 200, body: { message: 'Announcement deleted.' } };
}

module.exports = { listAll, listActive, create, update, remove };
