const config = require("./config");

const wsRateLimiter = new Map();

function checkWSRateLimit(identifier) {
  const now = Date.now();
  const userRequests = wsRateLimiter.get(identifier) || [];
  const recentRequests = userRequests.filter(
    (time) => now - time < config.rateLimitWindow
  );

  wsRateLimiter.set(identifier, recentRequests);

  if (recentRequests.length >= config.rateLimitMax) {
    return false;
  }

  recentRequests.push(now);
  wsRateLimiter.set(identifier, recentRequests);
  return true;
}

module.exports = {
  checkWSRateLimit,
  wsRateLimiter,
};
