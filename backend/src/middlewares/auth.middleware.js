const { verifyAccessToken } = require("../utils/jwt.utils");
const { sendError } = require("../utils/response.utils");

/**
 * protect — verifies JWT and attaches req.user = { userId, role, regNo }
 */
const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer "))
    return sendError(res, 401, "Access denied. No token provided.");

  try {
    const decoded = verifyAccessToken(header.split(" ")[1]);
    req.user = { userId: decoded.userId, role: decoded.role, regNo: decoded.regNo };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return sendError(res, 401, "Access token expired. Please refresh.");
    return sendError(res, 401, "Invalid token. Please log in again.");
  }
};

module.exports = { protect };
