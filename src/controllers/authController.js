const authService = require('../services/authService');

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

module.exports = {
  register,
  login,
  profile,
  updateProfile,
  getInstructorProfile,
  updateInstructorProfile,
  listAssignableInstructors,
};