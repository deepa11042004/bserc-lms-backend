const announcementService = require('../services/announcementService');

async function listAll(req, res) {
  try {
    const result = await announcementService.listAll();
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List announcements error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function listActive(req, res) {
  try {
    const result = await announcementService.listActive();
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List active announcements error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function create(req, res) {
  try {
    const result = await announcementService.create(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Create announcement error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid id.' });
    const result = await announcementService.update(id, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update announcement error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid id.' });
    const result = await announcementService.remove(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Delete announcement error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listAll, listActive, create, update, remove };
