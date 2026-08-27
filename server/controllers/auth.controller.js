import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/login", validate(loginValidator), login);
router.post("/register", validate(registerValidator), register);

export default router;
