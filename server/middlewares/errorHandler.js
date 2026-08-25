import { ApiError } from "../utils/ApiError.js";

/**
 * Single place where every error in the app ends up.
 * Controllers/services just `throw new ApiError(...)` (or let mongoose
 * throw) and never touch `res` directly for the error path.
 */
export const errorHandler = (err, req, res, next) => {
  const t = req.t || ((key) => key);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: t(err.messageKey, err.params),
    });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: t("common.validationError"),
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: t("common.validationError"),
      errors: [
        `Duplicate value for field: ${Object.keys(err.keyValue).join(", ")}`,
      ],
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: t("auth.invalidToken"),
    });
  }

  // Anything unexpected: log full detail server-side, never leak internals to client
  console.error("[Unhandled Error]", err);
  return res.status(500).json({
    success: false,
    message: t("common.serverError"),
  });
};

export const notFoundHandler = (req, res) => {
  const t = req.t || ((key) => key);
  res.status(404).json({ success: false, message: t("common.notFound") });
};

export default errorHandler;
