const courseResourceModel = require('../models/courseResourceModel');
const courseModel = require('../models/courseModel');
const { uploadCourseResource, deleteCourseResource, deriveResourceType } = require('../utils/s3CourseResource');

const normalizeText = (v = '') => String(v ?? '').trim();

const isValidUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

async function assertCourseExists(courseId) {
  const course = await courseModel.findById(courseId);
  if (!course) return { status: 404, body: { message: 'Course not found.' } };
  return null;
}

async function listResources(courseId) {
  const err = await assertCourseExists(courseId);
  if (err) return err;

  const resources = await courseResourceModel.listByCourse(courseId);
  return { status: 200, body: { resources } };
}

async function createFileResource({ courseId, title, file, displayOrder }) {
  const err = await assertCourseExists(courseId);
  if (err) return err;

  const cleanTitle = normalizeText(title);
  if (!cleanTitle) return { status: 400, body: { message: 'Title is required.' } };
  if (!file || !file.buffer || file.buffer.length === 0) {
    return { status: 400, body: { message: 'File is required.' } };
  }

  const uploaded = await uploadCourseResource({
    buffer: file.buffer,
    contentType: file.mimetype,
    originalName: file.originalname,
    courseId,
  });

  const existingCount = await courseResourceModel.listByCourse(courseId);
  const order = Number.isInteger(Number(displayOrder)) ? Number(displayOrder) : existingCount.length;

  const resource = await courseResourceModel.create({
    course_id: courseId,
    title: cleanTitle,
    resource_type: uploaded.resourceType,
    url: uploaded.url,
    s3_key: uploaded.key,
    file_size: uploaded.fileSize,
    mime_type: file.mimetype,
    original_name: file.originalname,
    display_order: order,
  });

  return { status: 201, body: { resource } };
}

async function createLinkResource({ courseId, title, url, displayOrder }) {
  const err = await assertCourseExists(courseId);
  if (err) return err;

  const cleanTitle = normalizeText(title);
  const cleanUrl = normalizeText(url);

  if (!cleanTitle) return { status: 400, body: { message: 'Title is required.' } };
  if (!cleanUrl || !isValidUrl(cleanUrl)) {
    return { status: 400, body: { message: 'A valid URL is required.' } };
  }

  const existingCount = await courseResourceModel.listByCourse(courseId);
  const order = Number.isInteger(Number(displayOrder)) ? Number(displayOrder) : existingCount.length;

  const resource = await courseResourceModel.create({
    course_id: courseId,
    title: cleanTitle,
    resource_type: 'link',
    url: cleanUrl,
    s3_key: null,
    file_size: null,
    mime_type: null,
    original_name: null,
    display_order: order,
  });

  return { status: 201, body: { resource } };
}

async function deleteResource(id) {
  const existing = await courseResourceModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'Resource not found.' } };

  if (existing.s3_key) {
    try {
      await deleteCourseResource(existing.s3_key);
    } catch {
      // S3 delete failure should not block DB cleanup
    }
  }

  await courseResourceModel.remove(id);
  return { status: 200, body: { message: 'Resource deleted successfully.' } };
}

module.exports = { listResources, createFileResource, createLinkResource, deleteResource };
