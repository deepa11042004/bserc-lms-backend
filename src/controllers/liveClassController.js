const liveClassService = require('../services/liveClassService');

async function listPublic(req, res) {
  try {
    const result = await liveClassService.listPublic();
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List public live classes error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function listAdmin(req, res) {
  try {
    const result = await liveClassService.listAdmin();
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List admin live classes error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function create(req, res) {
  try {
    const result = await liveClassService.create(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Create live class error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid live class id.' });
    const result = await liveClassService.update(id, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update live class error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid live class id.' });
    const result = await liveClassService.remove(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Delete live class error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listPublic, listAdmin, create, update, remove };
