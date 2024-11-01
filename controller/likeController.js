import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";

const prisma = new PrismaClient();

export const likePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;

  const likeStatus = await prisma.like.findFirst({
    where: {
      profileId: req.user.profile.id,
      postId,
    },
  });

  if (likeStatus) {
    await prisma.like.delete({
      where: {
        id: likeStatus.id,
      },
    });
    res.json({ isLike: false });
  } else {
    await prisma.like.create({
      data: {
        profileId: req.user.profile.id,
        postId,
      },
    });
    res.json({ isLike: true });
  }
});
