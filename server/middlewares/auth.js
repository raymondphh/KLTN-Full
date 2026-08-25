import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * decoded payload to req.user. Replaces the old middleware which:
 *  - returned 500 on a missing/invalid token instead of 401,
 *  - used the deprecated String.prototype.trimLeft,
 *  - didn't actually check for the "Bearer " prefix.
 */
export const verifyToken = catchAsync(async (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) throw ApiError.unauthorized("common.unauthorized");

  const token = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : header.trim();
  if (!token) throw ApiError.unauthorized("common.unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws JsonWebTokenError/TokenExpiredError -> handled centrally
  req.user = decoded;
  next();
});

/**
 * Role guard, composed after verifyToken.
 * Usage: router.get("/admin", verifyToken, requireRole("admin"), handler)
 */
export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("common.forbidden"));
    }
    next();
  };
