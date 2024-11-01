import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";
import Joi from "joi";

const prisma = new PrismaClient();

const commentSchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    "string.empty": "Komentar harus diisi",
    "string.min": "Komentar minimal 1 karakter",
  }),
});

export const createComment = asyncHandler(async (req, res) => {
  const { error } = commentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    // Map semua pesan error ke dalam array
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ messages: errorMessages });
  }

  const checkProfile = await prisma.profile.findFirst({
    where: {
      userId: req.user.id,
    },
  });

  if (!checkProfile) {
    res.status(404);
    throw new Error("User not found");
  }

  const comment = await prisma.comment.create({
    data: {
      ...req.body,
      postId: req.params.id,
      profileId: checkProfile.id,
    },
  });
  res.status(200).json({
    message: "Success create comment",
    data: comment,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const checkProfile = await prisma.profile.findFirst({
    where: {
      userId: req.user.id,
    },
  });

  if (!checkProfile) {
    res.status(404);
    throw new Error("User not found");
  }

  const getComment = await prisma.comment.findUnique({
    where: {
      id: req.params.id,
      profileId: checkProfile.id,
    },
  });

  if (!getComment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  await prisma.comment.delete({
    where: { id: getComment.id, profileId: getComment.profileId },
  });

  res.status(200).json({
    message: "Success delete comment",
  });
});
