const assignmentModel = require('../models/assignmentModel');
const { uploadAssignmentFile, deleteAssignmentFile } = require('../utils/s3Assignment');

async function listAll() {
  const entries = await assignmentModel.listAll();
  return { status: 200, body: { entries } };
}

async function create({ category, topic, file, displayOrder }) {
  if (!topic || !topic.trim()) return { status: 400, body: { message: 'Topic is required.' } };
  if (!file) return { status: 400, body: { message: 'File is required.' } };

  const { key, url, fileSize } = await uploadAssignmentFile({
    buffer: file.buffer,
    contentType: file.mimetype,
    originalName: file.originalname,
  });

  const entry = await assignmentModel.create({
    category: category ? category.trim() : null,
    topic: topic.trim(),
    file_url: url,
    s3_key: key,
    original_name: file.originalname,
    file_size: fileSize,
    mime_type: file.mimetype,
    display_order: Number(displayOrder) || 0,
  });

  return { status: 201, body: { entry } };
}

async function update(id, { category, topic, displayOrder }) {
  const existing = await assignmentModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Entry not found.' } };

  const entry = await assignmentModel.update(id, {
    category: category !== undefined ? (category ? category.trim() : null) : undefined,
    topic: topic !== undefined ? topic.trim() : undefined,
    display_order: displayOrder !== undefined ? Number(displayOrder) : undefined,
  });

  return { status: 200, body: { entry } };
}

async function remove(id) {
  const existing = await assignmentModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Entry not found.' } };

  await deleteAssignmentFile(existing.s3_key);
  await assignmentModel.remove(id);
  return { status: 200, body: { message: 'Deleted.' } };
}

module.exports = { listAll, create, update, remove };
