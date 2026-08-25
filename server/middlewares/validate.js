import { validationResult } from "express-validator";

/**
 * Runs an array of express-validator chains, then short-circuits with a
 * 400 + field-level errors if any failed. Keeps controllers free of
 * manual `if (!username || !password)` checks.
 *
 * Usage:
 *   router.post("/login", validate(loginValidator), login);
 */
export const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const t = req.t || ((key) => key);
  return res.status(400).json({
    success: false,
    message: t("common.validationError"),
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

export default validate;
