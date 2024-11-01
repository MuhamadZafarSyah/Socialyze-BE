import asyncHandler from "../middleware/asyncHandler.js";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Joi from "joi";

const prisma = new PrismaClient();

// JOI AUTHVALIDATION
const authSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email tidak valid",
    "any.required": "Email harus diisi",
    "string.empty": "Email harus diisi",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password harus diisi",
    "string.empty": "Password harus diisi",
    "string.min": "Password minimal 6 karakter",
  }),
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const isDev = process.env.NODE_ENV === "development" ? false : true;

  const cookieOptions = {
    expires: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    security: isDev,
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    data: user,
  });
};

export const register = asyncHandler(async (req, res) => {
  const { error } = authSchema.validate(req.body, { abortEarly: false });
  if (error) {
    // Map semua pesan error ke dalam array
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    throw new Error(errorMessages);
  }

  const { email } = req.body;
  let { password } = req.body;

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    res.status(400);
    throw new Error("Email Sudah Terdaftar");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password,
    },
  });

  createSendToken(user, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email dan password harus diisi");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      password: true,
      profile: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid email or password",
    });
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid email or password",
    });
  }

  user.profileId = user.profile.id;
  user.username = user.profile.username;
  delete user.password;
  delete user.profile;

  createSendToken(user, 200, res);
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    message: "logout success",
  });
});
