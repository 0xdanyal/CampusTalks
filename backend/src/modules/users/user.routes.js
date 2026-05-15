const router = require("express").Router();
const User   = require("./user.model");
const { protect }   = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const { sendSuccess, sendError } = require("../../utils/response.utils");
const ah = require("../../middlewares/asyncHandler.middleware");

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET /api/users/pending
router.get("/pending", protect, authorize("admin"), ah(async (req, res) => {
  const users = await User.find({ status: "pending" }).sort({ createdAt: 1 });
  return sendSuccess(res, 200, `${users.length} pending`, { users: users.map((u) => u.toPublicJSON()) });
}));

// GET /api/users?status=active&department=BSE&page=1&limit=20
router.get("/", protect, authorize("admin"), ah(async (req, res) => {
  const { status, department, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status)     filter.status = status;
  if (department) filter.department = department.toUpperCase();

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Users fetched", {
    users: users.map((u) => u.toPublicJSON()),
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
}));

// PATCH /api/users/:id/approve
router.patch("/:id/approve", protect, authorize("admin"), ah(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)                   return sendError(res, 404, "User not found");
  if (user.status !== "pending") return sendError(res, 400, "User is not pending");

  user.status    = "active";
  user.adminNote = req.body.note || "Approved by admin";
  await user.save();
  return sendSuccess(res, 200, "User approved", { user: user.toPublicJSON() });
}));

// PATCH /api/users/:id/suspend
router.patch("/:id/suspend", protect, authorize("admin"), ah(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)                return sendError(res, 404, "User not found");
  if (user.role === "admin") return sendError(res, 403, "Cannot suspend an admin");

  user.status       = "suspended";
  user.adminNote    = req.body.note || "Suspended by admin";
  user.refreshToken = null; // Force logout immediately
  await user.save();
  return sendSuccess(res, 200, "User suspended", { user: user.toPublicJSON() });
}));

// PATCH /api/users/:id/graduate
router.patch("/:id/graduate", protect, authorize("admin"), ah(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, "User not found");

  user.status       = "graduated";
  user.adminNote    = req.body.note || "Marked as graduated";
  user.refreshToken = null;
  await user.save();
  return sendSuccess(res, 200, "Marked as graduated", { user: user.toPublicJSON() });
}));

// ── Student routes ────────────────────────────────────────────────────────────

// GET /api/users/:id/profile  (any logged-in user)
router.get("/:id/profile", protect, ah(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, status: "active" });
  if (!user) return sendError(res, 404, "User not found");
  return sendSuccess(res, 200, "Profile fetched", { user: user.toPublicJSON() });
}));

module.exports = router;
