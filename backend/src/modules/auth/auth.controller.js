const authService = require("./auth.service");
const { signupSchema, loginSchema, refreshSchema } = require("./auth.validator");
const { sendSuccess, sendError } = require("../../utils/response.utils");

const signup = async (req, res) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success)
    return sendError(res, 400, "Validation failed", result.error.flatten().fieldErrors);

  const { regNo, name, password } = result.data;
  const user = await authService.signup({ regNo, name, password });
  return sendSuccess(res, 201, "Account created! Awaiting admin approval before you can log in.", { user });
};

const login = async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success)
    return sendError(res, 400, "Validation failed", result.error.flatten().fieldErrors);

  const { accessToken, refreshToken, user } = await authService.login(result.data);
  return sendSuccess(res, 200, "Logged in successfully", { accessToken, refreshToken, user });
};

const refresh = async (req, res) => {
  const result = refreshSchema.safeParse(req.body);
  if (!result.success) return sendError(res, 400, "Refresh token is required.");

  const { accessToken } = await authService.refreshAccessToken(result.data.refreshToken);
  return sendSuccess(res, 200, "Token refreshed", { accessToken });
};

const logout = async (req, res) => {
  await authService.logout(req.user.userId);
  return sendSuccess(res, 200, "Logged out successfully");
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  return sendSuccess(res, 200, "Current user", { user });
};

module.exports = { signup, login, refresh, logout, getMe };
