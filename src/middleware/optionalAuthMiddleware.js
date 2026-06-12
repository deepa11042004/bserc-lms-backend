const { verifyToken } = require('../utils/jwt');

function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (token && scheme?.toLowerCase() === 'bearer') {
      req.user = verifyToken(token);
    }
  } catch {
    // invalid token — treat as unauthenticated
  }
  return next();
}

module.exports = optionalAuthMiddleware;
