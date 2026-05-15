const User = require("./user.model");
const { sendSuccess, sendError } = require("../../utils/response.utils");

/**
 * user.controller.js
 * Admin user management + public profile fetching.
 */

// ─── GET /api/users/pending ───────────────────────────────────────────────────
const getPendingUsers = async (req, res) => {
  const users = await User.find({ status: "pending" }).sort({ createdAt: 1 });
  return sendSuccess(res, 200, `${users.length} pending user(s) found`, { users: users.map(u => u.toPublicJSON()) });
};

// ─── PATCH /api/users/:id/approve ────────────────────────────────────────────
const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, "User not found");
  if (user.status !== "pending") return sendError(res, 400, "User is not in pending state");

  user.status = "active";
  user.adminNote = req.body.note || "Approved by admin";
  await user.save();

  return sendSuccess(res, 200, "User approved successfully", { user: user.toPublicJSON() });
};

// ─── PATCH /api/users/:id/suspend ────────────────────────────────────────────
const suspendUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, "User not found");
  if (user.role === "admin") return sendError(res, 403, "Cannot suspend an admin account");

  user.status = "suspended";
  user.adminNote = req.body.note || "Suspended by admin";
  // Invalidate their refresh token immediately
  user.refreshToken = null;
  await user.save();

  return sendSuccess(res, 200, "User suspended", { user: user.toPublicJSON() });
};

// ─── PATCH /api/users/:id/graduate ───────────────────────────────────────────
const graduateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, "User not found");

  user.status = "graduated";
  user.adminNote = req.body.note || "Marked as graduated";
  user.refreshToken = null; // Revoke access
  await user.save();

  return sendSuccess(res, 200, "User marked as graduated", { user: user.toPublicJSON() });
};

// ─── GET /api/users ───────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  const { status, department, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department.toUpperCase();

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Users fetched", {
    users: users.map(u => u.toPublicJSON()),
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// ─── GET /api/users/:id/profile ───────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.status !== "active") return sendError(res, 404, "User not found");

  return sendSuccess(res, 200, "Profile fetched", { user: user.toPublicJSON() });
};

module.exports = { getPendingUsers, approveUser, suspendUser, graduateUser, getAllUsers, getUserProfile };
