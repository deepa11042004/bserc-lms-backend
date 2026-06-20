/**
 * rateLimiter.js
 *
 * Provides Express middleware for IP-based rate limiting using the
 * `express-rate-limit` package. Two limiters are exported:
 *
 *  - globalLimiter : Applied to every incoming request across the entire API.
 *                    Acts as a general shield against traffic floods and
 *                    denial-of-service (DoS) attempts.
 *
 *  - authLimiter   : Applied exclusively to authentication routes (/auth/*).
 *                    Uses a much lower threshold to protect against brute-force
 *                    password attacks and credential-stuffing attempts.
 *
 * Both limiters track requests per IP address using an in-memory store
 * (the default). This is sufficient for a single-instance Node.js deployment.
 * If the app ever scales to multiple instances behind a load balancer, the
 * store should be replaced with a shared store (e.g. redis-rate-limit-store)
 * so that counts are shared across all instances.
 *
 * Rate-limit state is communicated to clients via standard HTTP headers:
 *   RateLimit-Limit        – max requests allowed in the window
 *   RateLimit-Remaining    – requests remaining in the current window
 *   RateLimit-Reset        – UTC epoch seconds when the window resets
 * (Legacy X-RateLimit-* headers are intentionally disabled.)
 */

const rateLimit = require('express-rate-limit');

/**
 * globalLimiter
 *
 * Limits each IP to 100 requests per 15-minute sliding window across all
 * API routes. Designed to absorb normal traffic spikes while blocking
 * abusive automated clients.
 *
 * When the limit is exceeded:
 *  - HTTP 429 (Too Many Requests) is returned.
 *  - The response body is a JSON object so API clients receive a consistent
 *    format rather than the default plain-text or HTML error page.
 */
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10-minute rolling window
  max: 100,                  // max requests per IP per window
  standardHeaders: true,     // send RateLimit-* headers (RFC-compliant)
  legacyHeaders: false,      // suppress deprecated X-RateLimit-* headers
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/**
 * authLimiter
 *
 * Limits each IP to 20 requests per 10-minute window on authentication
 * routes (/auth/login, /auth/register, etc.).
 *
 * Why stricter than the global limiter:
 *  - Brute-force attacks repeatedly try different passwords against one account.
 *  - Credential stuffing attacks try one password across many accounts.
 *  - Both patterns generate rapid, repeated hits on auth endpoints.
 *  20 attempts per 10 minutes is generous enough for legitimate users
 *  (e.g. mistyping a password a few times) but low enough to make automated
 *  attacks computationally expensive.
 *
 * Note: Because globalLimiter is also applied before authLimiter in app.js,
 * a request to /auth/* must satisfy BOTH limits. The stricter authLimiter
 * will normally be the binding constraint.
 */
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10-minute rolling window
  max: 20,                   // max auth attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

module.exports = { globalLimiter, authLimiter };
