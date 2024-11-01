import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";

const prisma = new PrismaClient();

export const savePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;

  const savedPost = await prisma.savedPost.findFirst({
    where: {
      profileId: req.user.profile.id,
      postId,
    },
  });

  if (savedPost) {
    await prisma.savedPost.delete({
      where: {
        id: savedPost.id,
      },
    });
    res.json({ isSave: false });
  } else {
    await prisma.savedPost.create({
      data: {
        profileId: req.user.profile.id,
        postId,
      },
    });
    res.json({ isSave: true });
  }
});

export const getSavePost = asyncHandler(async (req, res) => {
  const getPost = await prisma.post.findMany({
    where: {
      savedPosts: {
        some: {
          profileId: req.user.profile.id,
        },
      },
    },
    include: {
      likes: {
        where: {
          profileId: req.user.profile.id,
        },
      },
      savedPosts: {
        where: {
          profileId: req.user.profile.id,
        },
      },
      profile: true,
      _count: {
        select: {
          likes: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          profile: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const transformedPosts = getPost.map((post) => ({
    id: post.id,
    caption: post.caption,
    postImage: post.postImage,
    createdAt: post.createdAt,
    profile: post.profile,
    comments: post.comments,
    _count: post._count,
    isSaved: post.savedPosts.length > 0,
    isLiked: post.likes.length > 0,
  }));

  res.status(200).json({
    message: "Success get saved post",
    data: transformedPosts,
  });
});
