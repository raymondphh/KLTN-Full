import express from "express";
import {
  createThesis,
  getAllTheses,
  getThesisById,
  getRegisteredThesisId,
  teacherUpdate,
  updateRegistrationStatus,
  deleteThesis,
  getThesisByTeacherCode,
  deleteMember,
} from "../controllers/thesis.controller.js";
import { verifyToken } from "../middlewares/auth.js";
import {
  checkTeacherDeadline,
  checkStudentDeadline,
} from "../middlewares/checkDeadline.js";
import { validate } from "../middlewares/validate.js";
import {
  createThesisValidator,
  updateThesisValidator,
  thesisIdParamValidator,
  deleteMemberValidator,
} from "../validators/thesis.validator.js";

const router = express.Router();

// create
router.post(
  "/",
  verifyToken,
  checkTeacherDeadline,
  validate(createThesisValidator),
  createThesis,
);

// read
router.get("/", verifyToken, getAllTheses);
router.get("/registered", verifyToken, getRegisteredThesisId);
router.get("/getbyteachercode", verifyToken, getThesisByTeacherCode);
router.get(
  "/getbyid/:id",
  verifyToken,
  validate(thesisIdParamValidator),
  getThesisById,
);

// update
router.put(
  "/update/:id",
  verifyToken,
  checkTeacherDeadline,
  validate(updateThesisValidator),
  teacherUpdate,
);
router.put(
  "/change/:id",
  verifyToken,
  checkStudentDeadline,
  validate(thesisIdParamValidator),
  updateRegistrationStatus,
);

// delete
router.put(
  "/deletemember/:id",
  verifyToken,
  validate(deleteMemberValidator),
  deleteMember,
);
router.delete(
  "/:id",
  verifyToken,
  checkTeacherDeadline,
  validate(thesisIdParamValidator),
  deleteThesis,
);

export default router;
