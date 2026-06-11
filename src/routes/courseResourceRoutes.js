const express = require('express');
const multer = require('multer');
const courseResourceController = require('../controllers/courseResourceController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');
const { MAX_FILE_SIZE } = require('../utils/s3CourseResource');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * @swagger
 * /api/courses/{courseId}/resources:
 *   get:
 *     summary: List resources for a course
 *     description: Returns all resources attached to a course. Requires authentication.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of course resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resources:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       course_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       resource_type:
 *                         type: string
 *                         enum: [pdf, doc, spreadsheet, presentation, image, video, audio, archive, text, code, link, other]
 *                       url:
 *                         type: string
 *                       file_size:
 *                         type: integer
 *                         nullable: true
 *                       original_name:
 *                         type: string
 *                         nullable: true
 *                       display_order:
 *                         type: integer
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/courses/:courseId/resources',
  authMiddleware,
  courseResourceController.listResources
);

/**
 * @swagger
 * /api/courses/{courseId}/resources/{id}/download:
 *   get:
 *     summary: Download a course resource
 *     description: Streams an S3 file directly through the backend (no public S3 access needed). Redirects to the URL for external links.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: File streamed with Content-Disposition attachment header
 *       302:
 *         description: Redirect to external link
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/courses/:courseId/resources/:id/download',
  authMiddleware,
  courseResourceController.downloadResource
);

/**
 * @swagger
 * /api/admin/courses/{courseId}/resources:
 *   post:
 *     summary: Upload a file or add a link resource to a course
 *     description: |
 *       Add a resource to a course. Send as multipart/form-data for file uploads, or application/json with a `url` field for external links.
 *       Requires admin, super_admin, or instructor role. Max file size 50 MB.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, file]
 *             properties:
 *               title:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               display_order:
 *                 type: integer
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, url]
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/admin/courses/:courseId/resources',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  upload.single('file'),
  courseResourceController.createResource
);

/**
 * @swagger
 * /api/admin/courses/{courseId}/resources/{id}:
 *   delete:
 *     summary: Delete a course resource
 *     description: Deletes the resource record and the associated S3 file (if any). Requires admin, super_admin, or instructor role.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/admin/courses/:courseId/resources/:id',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  courseResourceController.deleteResource
);

module.exports = router;
