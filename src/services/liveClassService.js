const liveClassModel = require('../models/liveClassModel');

const trim = (v = '') => String(v ?? '').trim();

async function listPublic() {
  const classes = await liveClassModel.listAll({ activeOnly: true });
  return { status: 200, body: { classes } };
}

async function listAdmin() {
  const classes = await liveClassModel.listAll({ activeOnly: false });
  return { status: 200, body: { classes } };
}

async function create(payload) {
  const title = trim(payload.title);
  if (!title) return { status: 400, body: { message: 'Title is required.' } };

  const meeting_link = trim(payload.meeting_link);
  if (!meeting_link) return { status: 400, body: { message: 'Meeting link is required.' } };

  if (!payload.scheduled_at) return { status: 400, body: { message: 'Scheduled date/time is required.' } };

  const cls = await liveClassModel.create({
    title,
    description: trim(payload.description),
    instructor_name: trim(payload.instructor_name),
    platform: trim(payload.platform) || 'Zoom',
    meeting_link,
    meeting_id: trim(payload.meeting_id),
    meeting_password: trim(payload.meeting_password),
    scheduled_at: payload.scheduled_at,
    duration_minutes: Number(payload.duration_minutes) || 60,
    notes: trim(payload.notes),
    is_active: payload.is_active === undefined ? true : Boolean(payload.is_active),
  });

  return { status: 201, body: { class: cls } };
}

async function update(id, payload) {
  const existing = await liveClassModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Live class not found.' } };

  const updates = {};

  if (payload.title !== undefined) {
    const title = trim(payload.title);
    if (!title) return { status: 400, body: { message: 'Title is required.' } };
    updates.title = title;
  }
  if (payload.meeting_link !== undefined) {
    const meeting_link = trim(payload.meeting_link);
    if (!meeting_link) return { status: 400, body: { message: 'Meeting link is required.' } };
    updates.meeting_link = meeting_link;
  }
  if (payload.description !== undefined)      updates.description = trim(payload.description);
  if (payload.instructor_name !== undefined)  updates.instructor_name = trim(payload.instructor_name);
  if (payload.platform !== undefined)         updates.platform = trim(payload.platform) || 'Zoom';
  if (payload.meeting_id !== undefined)       updates.meeting_id = trim(payload.meeting_id);
  if (payload.meeting_password !== undefined) updates.meeting_password = trim(payload.meeting_password);
  if (payload.scheduled_at !== undefined)     updates.scheduled_at = payload.scheduled_at;
  if (payload.duration_minutes !== undefined) updates.duration_minutes = Number(payload.duration_minutes) || 60;
  if (payload.notes !== undefined)            updates.notes = trim(payload.notes);
  if (payload.is_active !== undefined)        updates.is_active = Boolean(payload.is_active);

  const cls = await liveClassModel.update(id, updates);
  return { status: 200, body: { class: cls } };
}

async function remove(id) {
  const existing = await liveClassModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Live class not found.' } };
  await liveClassModel.remove(id);
  return { status: 200, body: { message: 'Live class deleted.' } };
}

module.exports = { listPublic, listAdmin, create, update, remove };
