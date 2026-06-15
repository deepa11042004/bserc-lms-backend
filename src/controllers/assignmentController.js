const assignmentService = require('../services/assignmentService');
const assignmentModel = require('../models/assignmentModel');
const { streamAssignmentToResponse } = require('../utils/s3Assignment');

async function listAll(req, res) {
  try {
    const result = await assignmentService.listAll();
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Assignment listAll error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function create(req, res) {
  try {
    const { category, topic, display_order } = req.body || {};
    const result = await assignmentService.create({
      category,
      topic,
      file: req.file,
      displayOrder: display_order,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Assignment create error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ message: 'Invalid id.' });
    const { category, topic, display_order } = req.body || {};
    const result = await assignmentService.update(id, { category, topic, displayOrder: display_order });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Assignment update error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ message: 'Invalid id.' });
    const result = await assignmentService.remove(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Assignment remove error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function download(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ message: 'Invalid id.' });

    const entry = await assignmentModel.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found.' });

    await streamAssignmentToResponse(
      entry.s3_key,
      { contentType: entry.mime_type, originalName: entry.original_name, fileSize: entry.file_size },
      res
    );
  } catch (err) {
    console.error('Assignment download error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listAll, create, update, remove, download };
