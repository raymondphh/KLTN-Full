import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("username must be 3-20 characters"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("role")
    .isIn(["admin", "teacher", "student"])
    .withMessage("invalid role"),
  body("firstName").trim().notEmpty().withMessage("firstName is required"),
  body("lastName").trim().notEmpty().withMessage("lastName is required"),
  body("code").trim().notEmpty().withMessage("code is required"),
  body("phoneNumber")
    .optional({ checkFalsy: true })
    .isMobilePhone("any")
    .withMessage("invalid phone number"),
];

export const loginValidator = [
  body("username").trim().notEmpty().withMessage("username is required"),
  body("password").notEmpty().withMessage("password is required"),
];
