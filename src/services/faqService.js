const faqModel = require('../models/faqModel');

const normalizeText = (value = '') => String(value ?? '').trim();

function validate({ question, answer }) {
  if (!normalizeText(question)) return 'Question is required.';
  if (!normalizeText(answer)) return 'Answer is required.';
  return null;
}

async function listFaqs({ includeUnpublished = false } = {}) {
  const faqs = await faqModel.listFaqs({ includeUnpublished });
  return { status: 200, body: { faqs } };
}

async function createFaq(payload) {
  const question = normalizeText(payload.question);
  const answer = normalizeText(payload.answer);
  const error = validate({ question, answer });
  if (error) return { status: 400, body: { message: error } };

  const display_order = Number.isInteger(Number(payload.display_order)) ? Number(payload.display_order) : 0;
  const is_published = payload.is_published === undefined ? true : Boolean(payload.is_published);

  const faq = await faqModel.createFaq({ question, answer, display_order, is_published });
  return { status: 201, body: { faq } };
}

async function updateFaq(id, payload) {
  const existing = await faqModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'FAQ not found.' } };

  const updates = {};
  if (payload.question !== undefined) updates.question = normalizeText(payload.question);
  if (payload.answer !== undefined) updates.answer = normalizeText(payload.answer);
  if (payload.display_order !== undefined) updates.display_order = Number(payload.display_order);
  if (payload.is_published !== undefined) updates.is_published = Boolean(payload.is_published);

  if (updates.question !== undefined || updates.answer !== undefined) {
    const error = validate({
      question: updates.question ?? existing.question,
      answer: updates.answer ?? existing.answer,
    });
    if (error) return { status: 400, body: { message: error } };
  }

  const faq = await faqModel.updateFaq(id, updates);
  return { status: 200, body: { faq } };
}

async function deleteFaq(id) {
  const existing = await faqModel.findById(id);
  if (!existing) return { status: 404, body: { message: 'FAQ not found.' } };

  await faqModel.deleteFaq(id);
  return { status: 200, body: { message: 'FAQ deleted successfully.' } };
}

module.exports = { listFaqs, createFaq, updateFaq, deleteFaq };
