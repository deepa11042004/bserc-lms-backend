const { signToken, verifyRefreshToken, signRefreshToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_active === 0 || user.is_active === false) {
      return res.status(403).json({ message: 'Account disabled' });
    }

    const newAccessToken = signToken({ userId: user.id, email: user.email, role: user.role }, '15m');
    const newRefreshToken = signRefreshToken({ userId: user.id });

    return res.status(200).json({
      message: 'Token refreshed successfully',
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

module.exports = {
  refreshAccessToken,
};
