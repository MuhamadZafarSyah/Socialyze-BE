import { json } from "express";
import { PrismaClient } from "@prisma/client";
import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import Joi from "joi";

const prisma = new PrismaClient();

const profileSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "any.required": "Nama harus diisi",
    "string.min": "Nama minimal 1 karakter",
  }),

  username: Joi.string().min(1).required().messages({
    "any.required": "Username harus diisi",
    "string.min": "Username minimal 1 karakter",
  }),
  gender: Joi.string().required().messages({
    "any.required": "Gender Harus diisi",
  }),
});

export const getAllUser = asyncHandler(async (req, res) => {
  const users = await prisma.profile.findMany();
  res.status(200).json({
    message: "Success get user",
    data: users,
  });
});

export const profileDetail = asyncHandler(async (req, res) => {
  const user = await prisma.profile.findUnique({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).json({
    message: "Success get detail user",
    data: user,
  });
});

export const myProfile = asyncHandler(async (req, res) => {
  const myProfile = await prisma.profile.findFirst({
    where: {
      userId: req.user.id,
    },
  });

  res.status(200).json({
    message: "Success get my profile",
    data: myProfile,
  });
});

export const createProfile = asyncHandler(async (req, res) => {
  const checkProfile = await prisma.profile.findFirst({
    where: {
      userId: req.user.id,
    },
  });

  if (checkProfile) {
    res.status(409);
    throw new Error("Profile already exist");
  }

  const { error } = profileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    // Map semua pesan error ke dalam array
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ messages: errorMessages });
  }
  const { name, username, gender } = req.body;

  const existingUser = await prisma.profile.findUnique({
    where: { username },
  });

  if (existingUser) {
    return res.status(400).json({ message: "Username sudah dipakai" });
  }

  const createProfile = await prisma.profile.create({
    data: {
      name,
      username,
      gender,
      userId: req.user.id,
    },
  });

  res.status(200).json({
    message: "Success create profile",
    data: createProfile,
  });
});

export const editProfile = asyncHandler(async (req, res) => {
  const checkProfile = await prisma.profile.findFirst({
    where: {
      userId: req.user.id,
    },
  });

  if (!checkProfile) {
    res.status(404);
    throw new Error("User not found");
  }

  const existingUser = await prisma.profile.findUnique({
    where: { username: req.body.username },
  });

  if (existingUser) {
    return res.status(400).json({ message: "Username sudah dipakai" });
  }

  const updatedProfile = await prisma.profile.update({
    where: {
      id: checkProfile.id,
    },
    data: req.body,
  });

  res.status(200).json({
    message: "Success edit profile",
    data: updatedProfile,
  });
});
