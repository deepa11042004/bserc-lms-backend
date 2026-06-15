const express = require('express');
const multer = require('multer');
const controller = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');
const { MAX_FILE_SIZE } = require('../utils/s3Assignment');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_SIZE } });

router.get('/assignments', controller.listAll);
router.get('/assignments/:id/download', authMiddleware, controller.download);

router.post('/admin/assignments', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), upload.single('file'), controller.create);
router.put('/admin/assignments/:id', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.update);
router.delete('/admin/assignments/:id', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), controller.remove);

module.exports = router;
