const recordedClassModel = require('../models/recordedClassModel');

const normalizeText = (value = '') => String(value ?? '').trim();

async function listCoursesWithClasses({ includeUnpublished = false } = {}) {
  const courses = await recordedClassModel.listCoursesWithClasses({ includeUnpublished });
  return { status: 200, body: { courses } };
}

async function createCourse(payload) {
  const title = normalizeText(payload.title);
  if (!title) return { status: 400, body: { message: 'Course title is required.' } };
  const display_order = Number.isInteger(Number(payload.display_order)) ? Number(payload.display_order) : 0;
  const is_published = payload.is_published === undefined ? true : Boolean(payload.is_published);
  const course = await recordedClassModel.createCourse({ title, display_order, is_published });
  return { status: 201, body: { course } };
}

async function updateCourse(id, payload) {
  const existing = await recordedClassModel.findCourseById(id);
  if (!existing) return { status: 404, body: { message: 'Course not found.' } };
  const updates = {};
  if (payload.title !== undefined) {
    const title = normalizeText(payload.title);
    if (!title) return { status: 400, body: { message: 'Course title is required.' } };
    updates.title = title;
  }
  if (payload.display_order !== undefined) updates.display_order = Number(payload.display_order);
  if (payload.is_published !== undefined) updates.is_published = Boolean(payload.is_published);
  const course = await recordedClassModel.updateCourse(id, updates);
  return { status: 200, body: { course } };
}

async function deleteCourse(id) {
  const existing = await recordedClassModel.findCourseById(id);
  if (!existing) return { status: 404, body: { message: 'Course not found.' } };
  await recordedClassModel.deleteCourse(id);
  return { status: 200, body: { message: 'Course deleted successfully.' } };
}

async function createClass(payload) {
  const title = normalizeText(payload.title);
  if (!title) return { status: 400, body: { message: 'Class title is required.' } };
  const course_id = Number(payload.course_id);
  if (!Number.isInteger(course_id) || course_id < 1) {
    return { status: 400, body: { message: 'Valid course_id is required.' } };
  }
  const courseExists = await recordedClassModel.findCourseById(course_id);
  if (!courseExists) return { status: 404, body: { message: 'Course not found.' } };
  const display_order = Number.isInteger(Number(payload.display_order)) ? Number(payload.display_order) : 0;
  const is_published = payload.is_published === undefined ? true : Boolean(payload.is_published);
  const cls = await recordedClassModel.createClass({
    course_id,
    title,
    video_url: payload.video_url || null,
    resource_url: payload.resource_url || null,
    display_order,
    is_published,
  });
  return { status: 201, body: { class: cls } };
}

async function updateClass(id, payload) {
  const existing = await recordedClassModel.findClassById(id);
  if (!existing) return { status: 404, body: { message: 'Class not found.' } };
  const updates = {};
  if (payload.title !== undefined) {
    const title = normalizeText(payload.title);
    if (!title) return { status: 400, body: { message: 'Class title is required.' } };
    updates.title = title;
  }
  if (payload.video_url !== undefined) updates.video_url = payload.video_url || null;
  if (payload.resource_url !== undefined) updates.resource_url = payload.resource_url || null;
  if (payload.display_order !== undefined) updates.display_order = Number(payload.display_order);
  if (payload.is_published !== undefined) updates.is_published = Boolean(payload.is_published);
  const cls = await recordedClassModel.updateClass(id, updates);
  return { status: 200, body: { class: cls } };
}

async function deleteClass(id) {
  const existing = await recordedClassModel.findClassById(id);
  if (!existing) return { status: 404, body: { message: 'Class not found.' } };
  await recordedClassModel.deleteClass(id);
  return { status: 200, body: { message: 'Class deleted successfully.' } };
}

module.exports = { listCoursesWithClasses, createCourse, updateCourse, deleteCourse, createClass, updateClass, deleteClass };
