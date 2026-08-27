import Deadline from "../models/Deadline.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

const isDeadlineActive = async (type) => {
  const now = new Date();
  const count = await Deadline.countDocuments({
    type,
    startDate: { $lte: now },
    endDate: { $gte: now },
    isActive: true,
  });
  return count > 0;
};

export const checkTeacherDeadline = catchAsync(async (req, res, next) => {
  const active = await isDeadlineActive("teacherSubmitTopics");
  if (!active) throw ApiError.notFound("deadline.notActive");
  next();
});

export const checkStudentDeadline = catchAsync(async (req, res, next) => {
  const active = await isDeadlineActive("studentSubmitTopics");
  if (!active) throw ApiError.notFound("deadline.notActive");
  next();
});
