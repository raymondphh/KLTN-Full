import { body, param } from "express-validator";

export const createThesisValidator = [
  body("semester").trim().notEmpty().withMessage("semester is required"),
  body("year").trim().notEmpty().withMessage("year is required"),
  body("thesisName").trim().notEmpty().withMessage("thesisName is required"),
  body("studentQuantity")
    .notEmpty()
    .withMessage("studentQuantity is required")
    .isInt({ min: 1 })
    .withMessage("studentQuantity must be a positive number"),
  body("require").optional({ checkFalsy: true }).trim(),
];

export const updateThesisValidator = [
  param("id").isMongoId().withMessage("invalid thesis id"),
  body("thesisName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("thesisName cannot be empty"),
  body("studentQuantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("studentQuantity must be a positive number"),
  body("require").optional({ checkFalsy: true }).trim(),
];

export const thesisIdParamValidator = [
  param("id").isMongoId().withMessage("invalid thesis id"),
];

export const deleteMemberValidator = [
  param("id").isMongoId().withMessage("invalid thesis id"),
  body("deleteCode").trim().notEmpty().withMessage("deleteCode is required"),
];
