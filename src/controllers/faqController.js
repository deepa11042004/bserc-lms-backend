const faqService = require('../services/faqService');

async function listPublicFaqs(req, res) {
  try {
    const result = await faqService.listFaqs({ includeUnpublished: false });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List public FAQs error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function listAdminFaqs(req, res) {
  try {
    const result = await faqService.listFaqs({ includeUnpublished: true });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List admin FAQs error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function createFaq(req, res) {
  try {
    const result = await faqService.createFaq(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Create FAQ error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateFaq(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid FAQ id.' });
    }
    const result = await faqService.updateFaq(id, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update FAQ error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteFaq(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid FAQ id.' });
    }
    const result = await faqService.deleteFaq(id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Delete FAQ error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listPublicFaqs, listAdminFaqs, createFaq, updateFaq, deleteFaq };
