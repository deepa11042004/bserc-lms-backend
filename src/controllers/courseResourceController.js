const courseResourceService = require('../services/courseResourceService');
const courseResourceModel = require('../models/courseResourceModel');
const { streamCourseResourceToResponse } = require('../utils/s3CourseResource');

async function listResources(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId) || courseId < 1) {
      return res.status(400).json({ message: 'Invalid course id.' });
    }
    const result = await courseResourceService.listResources(courseId);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List resources error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function createResource(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId) || courseId < 1) {
      return res.status(400).json({ message: 'Invalid course id.' });
    }

    const { title, display_order } = req.body || {};

    if (req.file) {
      const result = await courseResourceService.createFileResource({
        courseId,
        title,
        file: req.file,
        displayOrder: display_order,
      });
      return res.status(result.status).json(result.body);
    }

    const { url } = req.body || {};
    const result = await courseResourceService.createLinkResource({
      courseId,
      title,
      url,
      displayOrder: display_order,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Create resource error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteResource(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid resource id.' });
    }
    const result = await courseResourceService.deleteResource(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Delete resource error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function downloadResource(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid resource id.' });
    }

    const resource = await courseResourceModel.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });

    // External link — redirect directly
    if (!resource.s3_key) {
      return res.redirect(302, resource.url);
    }

    // S3 file — stream through backend so no public S3 access is required
    await streamCourseResourceToResponse(
      resource.s3_key,
      { contentType: resource.mime_type, originalName: resource.original_name, fileSize: resource.file_size },
      res
    );
  } catch (err) {
    console.error('Download resource error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = { listResources, createResource, deleteResource, downloadResource };
