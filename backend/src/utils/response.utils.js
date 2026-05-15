// Every controller uses these — keeps FE parsing 100% consistent

const sendSuccess = (res, statusCode = 200, message = "Success", data = {}) =>
  res.status(statusCode).json({ success: true, message, data });

const sendError = (res, statusCode = 500, message = "Something went wrong", errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
