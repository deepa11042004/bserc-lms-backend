const jwt = require('jsonwebtoken');

function signToken(payload, expiresIn = '15m') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
};