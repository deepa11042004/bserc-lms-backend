const authService = require('../services/authService');
const { uploadAvatar, streamAvatarToResponse, deleteAvatar } = require('../utils/s3Avatar');
const userProfileModel = require('../models/userProfileModel');

async function register(req, res) {
  try {
    const payload = req.body || {};
    const result = await authService.register({
      full_name: payload.full_name,
      email: payload.email,
      password: payload.password,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const payload = req.body || {};
    const result = await authService.login({
      email: payload.email,
      password: payload.password,
      requiredRole: payload.requiredRole,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function profile(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await authService.getProfile(userId);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await authService.updateProfile(userId, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getInstructorProfile(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await authService.getInstructorProfile(userId);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Get instructor profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateInstructorProfile(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await authService.updateInstructorProfile(userId, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Update instructor profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function listAssignableInstructors(req, res) {
  try {
    const result = await authService.listAssignableInstructors();
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('List assignable instructors error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function uploadAvatarHandler(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    // Delete old avatar from S3 if it was one we uploaded (stored as s3 key)
    const existing = await userProfileModel.findByUserId(userId);
    const oldKey = existing?.profile_picture_url;
    if (oldKey && oldKey.startsWith('users/avatars/')) {
      await deleteAvatar(oldKey).catch(() => {});
    }

    const { key } = await uploadAvatar({
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
      userId,
    });

    // Store the S3 key (not a public URL) — served via proxy endpoint
    await userProfileModel.upsertByUserId(userId, {
      ...(existing || {}),
      profile_picture_url: key,
    });

    return res.status(200).json({ s3_key: key });
  } catch (err) {
    console.error('Upload avatar error:', err);
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function serveAvatar(req, res) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId < 1)
      return res.status(400).json({ message: 'Invalid user id.' });

    const profile = await userProfileModel.findByUserId(userId);
    const key = profile?.profile_picture_url;

    if (!key || !key.startsWith('users/avatars/'))
      return res.status(404).json({ message: 'No avatar.' });

    await streamAvatarToResponse(key, res);
  } catch (err) {
    console.error('Serve avatar error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  register,
  login,
  profile,
  updateProfile,
  uploadAvatarHandler,
  serveAvatar,
  getInstructorProfile,
  updateInstructorProfile,
  listAssignableInstructors,
};