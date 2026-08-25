/**
 * Standard application error.
 * `messageKey` maps to a key in /locales/{lng}.json so the same error
 * can be rendered in English or Vietnamese depending on the request.
 *
 * Usage: throw new ApiError(404, "auth.userNotFound");
 */
export class ApiError extends Error {
  constructor(statusCode, messageKey, params = {}) {
    super(messageKey);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.messageKey = messageKey;
    this.params = params;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(key, params) {
    return new ApiError(400, key, params);
  }
  static unauthorized(key = "common.unauthorized", params) {
    return new ApiError(401, key, params);
  }
  static forbidden(key = "common.forbidden", params) {
    return new ApiError(403, key, params);
  }
  static notFound(key = "common.notFound", params) {
    return new ApiError(404, key, params);
  }
  static conflict(key, params) {
    return new ApiError(409, key, params);
  }
}

export default ApiError;
