import { catchAsync } from "../utils/catchAsync.js";
import * as thesisService from "../services/thesis.service.js";

export const createThesis = catchAsync(async (req, res) => {
  const thesis = await thesisService.createThesis(req.body, req.user);
  res
    .status(201)
    .json({ success: true, message: req.t("thesis.created"), data: thesis });
});

export const getAllTheses = catchAsync(async (req, res) => {
  const result = await thesisService.getAllTheses(req.query);
  res.status(200).json({ success: true, data: result });
});

export const getThesisById = catchAsync(async (req, res) => {
  const thesis = await thesisService.getThesisById(req.params.id);
  res.status(200).json({ success: true, data: thesis });
});

export const getThesisByTeacherCode = catchAsync(async (req, res) => {
  const theses = await thesisService.getThesisByTeacherCode(req.user.code);
  res.status(200).json({ success: true, data: theses });
});

export const getRegisteredThesisId = catchAsync(async (req, res) => {
  const registeredThesisId = await thesisService.getRegisteredThesisId(
    req.user.code,
  );
  res.status(200).json({ success: true, data: { registeredThesisId } });
});

export const teacherUpdate = catchAsync(async (req, res) => {
  const thesis = await thesisService.teacherUpdateThesis(
    req.params.id,
    req.body,
    req.user,
  );
  res
    .status(200)
    .json({ success: true, message: req.t("thesis.updated"), data: thesis });
});

export const updateRegistrationStatus = catchAsync(async (req, res) => {
  const { thesis, wasRegistered } = await thesisService.toggleRegistration(
    req.params.id,
    req.user,
  );
  res.status(200).json({
    success: true,
    message: req.t(wasRegistered ? "thesis.unregistered" : "thesis.registered"),
    data: thesis,
  });
});

export const deleteThesis = catchAsync(async (req, res) => {
  await thesisService.deleteThesis(req.params.id, req.user);
  res.status(200).json({ success: true, message: req.t("thesis.deleted") });
});

export const deleteMember = catchAsync(async (req, res) => {
  const thesis = await thesisService.deleteMember(
    req.params.id,
    req.body.deleteCode,
  );
  res
    .status(200)
    .json({
      success: true,
      message: req.t("thesis.memberRemoved"),
      data: thesis,
    });
});
