const { sendError } = require("../utils/response.utils");

/**
 * authorize(...roles) — RBAC guard, always used AFTER protect
 * Usage: router.delete("/:id", protect, authorize("admin"), controller)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user)
    return sendError(res, 401, "Not authenticated.");

  if (!allowedRoles.includes(req.user.role))
    return sendError(res, 403, `Requires role: ${allowedRoles.join(" or ")}. Yours: ${req.user.role}`);

  next();
};

module.exports = { authorize };
