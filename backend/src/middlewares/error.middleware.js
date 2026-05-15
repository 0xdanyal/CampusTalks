/**
 * Global error handler — catches everything thrown in controllers/services
 */
const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") console.error("❌", err.stack);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ success: false, message: `"${field}" already exists.` });
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError")
    return res.status(400).json({ success: false, message: `Invalid ${err.path}.` });

  // JWT errors (backup — normally caught in middleware)
  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ success: false, message: "Invalid token." });
  if (err.name === "TokenExpiredError")
    return res.status(401).json({ success: false, message: "Token expired." });

  // Custom thrown errors with statusCode
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;
