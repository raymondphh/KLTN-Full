/**
 * Wraps an async route/controller so rejected promises are forwarded
 * to Express's error-handling middleware instead of needing a
 * try/catch block in every controller.
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
