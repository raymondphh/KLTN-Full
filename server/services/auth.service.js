import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

const SALT_ROUNDS = 10;
const TOKEN_TTL = "10h";

const toPublicUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;
  return user;
};

export const registerUser = async (payload) => {
  const {
    username,
    password,
    role,
    firstName,
    lastName,
    code,
    dob,
    classCode,
    major,
    phoneNumber,
  } = payload;

  const existingUser = await User.findOne({ username }).lean();
  if (existingUser) throw ApiError.conflict("auth.usernameTaken");

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    username,
    password: hashedPassword,
    role,
    firstName,
    lastName,
    code,
    dob,
    classCode,
    major,
    phoneNumber,
  });

  return toPublicUser(user);
};

export const loginUser = async ({ username, password }) => {
  const user = await User.findOne({ username });
  if (!user) throw ApiError.badRequest("auth.userNotFound");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.badRequest("auth.wrongPassword");

  const payload = {
    _id: user._id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    code: user.code,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });

  return { token, user: toPublicUser(user) };
};
