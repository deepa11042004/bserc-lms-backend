const scheduleService = require('../services/scheduleService');

async function listAll(req, res) {
  try {
    const result = await scheduleService.listAll();
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List schedule error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function create(req, res) {
  try {
    const result = await scheduleService.create(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Create schedule entry error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid id.' });
    const result = await scheduleService.update(id, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update schedule entry error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid id.' });
    const result = await scheduleService.remove(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Delete schedule entry error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listAll, create, update, remove };
