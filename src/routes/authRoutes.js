const express = require('express');
const multer = require('multer');

const authController = require('../controllers/authController');
const refreshController = require('../controllers/refreshController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const roles = require('../constants/roles');
const { MAX_AVATAR_SIZE } = require('../utils/s3Avatar');

const router = express.Router();
const avatarUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_AVATAR_SIZE } });

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *               requiredRole:
 *                 type: string
 *                 enum: [user, admin, instructor, super_admin]
 *                 description: Optional role restriction for login validation.
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid password
 *       403:
 *         description: Account disabled or role not authorized
 *       404:
 *         description: User not found
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token obtained from login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 *       404:
 *         description: User not found
 */
router.post('/refresh', refreshController.refreshAccessToken);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get currently authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/profile', authMiddleware, authController.profile);

/**
 * @openapi
 * /auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update currently authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               institution:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePictureUrl:
 *                 type: string
 *               notificationEmail:
 *                 type: boolean
 *               notificationWorkshopUpdates:
 *                 type: boolean
 *               notificationMarketing:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), authController.uploadAvatarHandler);
router.get('/avatar/:userId', authController.serveAvatar);

/**
 * @openapi
 * /auth/instructor-profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get instructor/admin profile settings for dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get(
  '/instructor-profile',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  authController.getInstructorProfile
);

/**
 * @openapi
 * /auth/instructor-profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update instructor/admin profile settings for dashboard
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [displayName, email, designation, alternativeEmail]
 *             properties:
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               designation:
 *                 type: string
 *               alternativeEmail:
 *                 type: string
 *                 format: email
 *               bio:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Instructor profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put(
  '/instructor-profile',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN, roles.INSTRUCTOR),
  authController.updateInstructorProfile
);

/**
 * @openapi
 * /auth/instructors:
 *   get:
 *     tags: [Auth]
 *     summary: List active instructors for instructor_id selection in admin course creation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructors fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/instructors',
  authMiddleware,
  requireRole(roles.ADMIN, roles.SUPER_ADMIN),
  authController.listAssignableInstructors
);

/**
 * @openapi
 * /auth/admin-only:
 *   get:
 *     tags: [Auth]
 *     summary: Verify admin or super admin role access
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/admin-only', authMiddleware, requireRole(roles.ADMIN, roles.SUPER_ADMIN), (req, res) => {
  res.status(200).json({ message: 'Admin access granted' });
});

/**
 * @openapi
 * /auth/instructor-only:
 *   get:
 *     tags: [Auth]
 *     summary: Verify instructor or super admin role access
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/instructor-only', authMiddleware, requireRole(roles.INSTRUCTOR, roles.SUPER_ADMIN), (req, res) => {
  res.status(200).json({ message: 'Instructor access granted' });
});

module.exports = router;