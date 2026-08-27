import Thesis from "../models/Thesis.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import StudentStatus from "../models/StudentStatus.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Broadcasts a notification to every user. Uses insertMany instead of a
 * forEach + fire-and-forget save() loop (the old code didn't await inside
 * forEach, so failures were silently swallowed and it was N sequential
 * round-trips to the DB instead of 1 bulk write).
 */
const notifyAllUsers = async (message) => {
  const users = await User.find().select("_id").lean();
  if (users.length === 0) return;
  await Notification.insertMany(
    users.map((u) => ({ userId: u._id, message })),
    { ordered: false },
  );
};

const removeStudentStatus = (studentCode) =>
  StudentStatus.deleteOne({ studentCode }).catch((err) =>
    console.error(
      `[thesis] failed to remove StudentStatus for ${studentCode}:`,
      err.message,
    ),
  );

const createStudentStatus = (studentCode, instructor) =>
  StudentStatus.create({ studentCode, instructor }).catch((err) =>
    console.error(
      `[thesis] failed to create StudentStatus for ${studentCode}:`,
      err.message,
    ),
  );

export const createThesis = async (payload, actor) => {
  const { semester, year, thesisName, studentQuantity, require } = payload;

  const thesis = await Thesis.create({
    semester,
    year,
    thesisName,
    instructorCode: actor.code,
    instructorName: `${actor.firstName} ${actor.lastName}`,
    instructorPhone: actor.phoneNumber,
    studentQuantity,
    require,
  });

  await notifyAllUsers(
    `${actor.code}-${actor.firstName} ${actor.lastName} vừa thêm một đề tài mới.`,
  );

  return thesis;
};

/**
 * Paginated + filterable listing. Backward compatible: with no query
 * params it behaves like the old `find()` (page=1, a sane default limit)
 * instead of always dumping the entire collection to the client.
 */
export const getAllTheses = async ({
  page = 1,
  limit = 20,
  semester,
  year,
  instructorCode,
  keyword,
} = {}) => {
  const filter = {};
  if (semester) filter.semester = semester;
  if (year) filter.year = year;
  if (instructorCode) filter.instructorCode = instructorCode;
  if (keyword) filter.thesisName = { $regex: keyword, $options: "i" };

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const [items, total] = await Promise.all([
    Thesis.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Thesis.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getThesisById = async (id) => {
  const thesis = await Thesis.findById(id);
  if (!thesis) throw ApiError.notFound("thesis.notFound");
  return thesis;
};

export const getThesisByTeacherCode = async (instructorCode) =>
  Thesis.find({ instructorCode }).sort({ createdAt: -1 });

/**
 * Old implementation loaded every thesis into memory and looped in JS to
 * find the one containing the student's code. This does the same lookup
 * as a single indexed query.
 */
export const getRegisteredThesisId = async (studentCode) => {
  const thesis = await Thesis.findOne({ members: studentCode }).select("_id");
  return thesis?._id ?? "";
};

export const teacherUpdateThesis = async (id, payload, actor) => {
  const { thesisName, studentQuantity, require } = payload;

  const thesis = await Thesis.findByIdAndUpdate(
    id,
    { thesisName, studentQuantity, require },
    { new: true, runValidators: true },
  );
  if (!thesis) throw ApiError.notFound("thesis.notFound");

  await notifyAllUsers(
    `${actor.code}-${actor.firstName} ${actor.lastName} vừa chỉnh sửa một đề tài.`,
  );

  return thesis;
};

export const toggleRegistration = async (id, student) => {
  const thesis = await Thesis.findById(id);
  if (!thesis) throw ApiError.notFound("thesis.notFound");

  const isRegistered = thesis.members.includes(student.code);

  if (isRegistered) {
    thesis.members = thesis.members.filter((code) => code !== student.code);
    await removeStudentStatus(student.code);
  } else {
    if (thesis.members.length >= Number(thesis.studentQuantity)) {
      throw ApiError.conflict("thesis.alreadyFull");
    }
    thesis.members.push(student.code);
    await createStudentStatus(student.code, thesis.instructorName);
  }

  await thesis.save();
  return { thesis, wasRegistered: isRegistered };
};

export const deleteThesis = async (id, actor) => {
  const thesis = await Thesis.findByIdAndDelete(id);
  if (!thesis) throw ApiError.notFound("thesis.notFound");

  await Promise.all(thesis.members.map((code) => removeStudentStatus(code)));
  await notifyAllUsers(
    `${actor.code}-${actor.firstName} ${actor.lastName} vừa xóa một đề tài.`,
  );

  return thesis;
};

export const deleteMember = async (id, deleteCode) => {
  const thesis = await Thesis.findById(id);
  if (!thesis) throw ApiError.notFound("thesis.notFound");

  thesis.members = thesis.members.filter((code) => code !== deleteCode);
  await thesis.save();
  await removeStudentStatus(deleteCode);

  return thesis;
};
