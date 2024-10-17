import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";
import Joi from "joi";

const prisma = new PrismaClient();

const postSchema = Joi.object({
  description: Joi.string().min(1).required().messages({
    "string.empty": "Deskripsi harus diisi",
    "string.min": "Deskripsi minimal 1 karakter",
  }),
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany();
  res.status(200).json({
    message: "Success get all posts",
    data: posts,
  });
});

export const myPosts = asyncHandler(async (req, res) => {
  const myPosts = await prisma.post.findMany({
    where: {
      userId: req.user.id,
    },
  });
  res.status(200).json({
    message: "Success get my posts",
    data: myPosts,
  });
});

export const getDetailPost = asyncHandler(async (req, res) => {
  const detailPost = await prisma.post.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!detailPost) {
    res.status(404);
    throw new Error("Postingan tidak ditemukan");
  }

  res.status(200).json({
    message: "Success get detail post",
    data: detailPost,
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const { error } = postSchema.validate(req.body, { abortEarly: false });
  if (error) {
    // Map semua pesan error ke dalam array
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ messages: errorMessages });
  }

  const { description } = req.body;

  const checkProfile = await prisma.profile.findFirst({
    where: {
      userId: req.user.id,
    },

    select: {
      id: true,
    },
  });

  if (!checkProfile) {
    res.status(404);
    throw new Error("Anda Dilarang Untuk Melakukan Aksi ini");
  }

  const createPost = await prisma.post.create({
    data: {
      userId: req.user.id,
      description,
      postImage: "lala",
    },
  });

  res.status(200).json({
    message: "Success create Post",
    data: createPost,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const checkProfile = await prisma.post.findFirst({
    where: {
      userId: req.user.id,
    },
  });

  if (!checkProfile) {
    res.status(404);
    throw new Error("Anda Dilarang Untuk Melakukan Aksi ini");
  }

  const deletePost = await prisma.post.delete({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!deletePost) {
    res.status(404);
    throw new Error("Posts Not Found");
  }

  res.status(200).json({
    message: "Success delete post",
  });
});
