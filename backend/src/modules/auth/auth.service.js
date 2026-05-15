const User = require("../users/user.model");
const { validateRegNo, parseRegNo } = require("../../utils/regNo.utils");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwt.utils");

// ── Helpers ───────────────────────────────────────────────────────────────────
const fail = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  throw err;
};

// ── Signup ────────────────────────────────────────────────────────────────────
const signup = async ({ regNo, name, password }) => {
  // 1. Validate reg number format + department
  const check = validateRegNo(regNo);
  if (!check.valid) fail(check.message, 400);

  const normalized = check.normalized;

  // 2. Check for existing active/pending user with same regNo
  const existing = await User.findOne({
    regNo: normalized,
    universityId: process.env.UNIVERSITY_ID || "default",
    status: { $in: ["active", "pending"] },
  });

  if (existing)
    fail(
      existing.status === "pending"
        ? "This reg number is already registered and awaiting admin approval."
        : "This reg number is already in use.",
      409
    );

  // 3. Parse batch + department from reg number
  const { batch, department } = parseRegNo(normalized);

  // 4. Create user — status starts as "pending" (admin must approve)
  const user = await User.create({
    regNo: normalized,
    name,
    password,
    department,
    batch,
    universityId: process.env.UNIVERSITY_ID || "default",
  });

  return user.toPublicJSON();
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async ({ regNo, password }) => {
  const normalized = regNo.trim().toUpperCase();

  // 1. Find user (include password + refreshToken, both select:false)
  const user = await User.findOne({
    regNo: normalized,
    universityId: process.env.UNIVERSITY_ID || "default",
  }).select("+password +refreshToken");

  // Generic message — don't reveal whether regNo exists
  if (!user) fail("Invalid registration number or password.", 401);

  // 2. Check status BEFORE password (don't leak password correctness)
  const statusMessages = {
    pending:   "Your account is pending admin approval.",
    suspended: "Your account has been suspended. Contact admin.",
    graduated: "Graduated accounts cannot log in. Contact admin if this is an error.",
  };
  if (statusMessages[user.status]) fail(statusMessages[user.status], 403);

  // 3. Verify password
  const ok = await user.comparePassword(password);
  if (!ok) fail("Invalid registration number or password.", 401);

  // 4. Issue tokens
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 5. Persist refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user: user.toPublicJSON() };
};

// ── Refresh ───────────────────────────────────────────────────────────────────
const refreshAccessToken = async (token) => {
  if (!token) fail("Refresh token is required.", 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    fail("Invalid or expired refresh token. Please log in again.", 401);
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user || user.refreshToken !== token)
    fail("Refresh token mismatch. Please log in again.", 401);

  return { accessToken: generateAccessToken(user) };
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// ── Get me ────────────────────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) fail("User not found.", 404);
  return user.toPublicJSON();
};

module.exports = { signup, login, refreshAccessToken, logout, getMe };
