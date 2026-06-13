const recordedClassService = require('../services/recordedClassService');

async function listPublicCourses(req, res) {
  try {
    const result = await recordedClassService.listCoursesWithClasses({ includeUnpublished: false });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List public recorded classes error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function listAdminCourses(req, res) {
  try {
    const result = await recordedClassService.listCoursesWithClasses({ includeUnpublished: true });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List admin recorded classes error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function createCourse(req, res) {
  try {
    const result = await recordedClassService.createCourse(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Create recorded class course error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateCourse(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid course id.' });
    const result = await recordedClassService.updateCourse(id, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update recorded class course error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteCourse(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid course id.' });
    const result = await recordedClassService.deleteCourse(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Delete recorded class course error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function createClass(req, res) {
  try {
    const result = await recordedClassService.createClass(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Create recorded class error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateClass(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid class id.' });
    const result = await recordedClassService.updateClass(id, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update recorded class error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteClass(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid class id.' });
    const result = await recordedClassService.deleteClass(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Delete recorded class error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  listPublicCourses,
  listAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createClass,
  updateClass,
  deleteClass,
};
