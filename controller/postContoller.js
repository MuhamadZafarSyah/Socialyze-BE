import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";
import Joi from "joi";

const prisma = new PrismaClient();

const postSchema = Joi.object({
  caption: Joi.string().min(1).required().messages({
    "string.min": "Caption minimal 1 karakter",
    "string.empty": "Caption harus diisi",
  }),
  postImage: Joi.string(),
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany({
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

  if (!posts) {
    res.status(404);
    throw new Error("Posts Not Found");
  }

  const transformedPosts = posts.map((post) => ({
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
    message: "Success get all posts",
    data: transformedPosts,
  });
});

export const getDetailPost = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const profile = await prisma.profile.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    res.status(404);
    throw new Error("Profile tidak ditemukan");
  }

  const findPost = await prisma.post.findMany({
    where: {
      profileId: profile.id,
    },
  });

  if (!findPost) {
    res.status(404);
    throw new Error("Postingan tidak ditemukan");
  }

  const detailPost = await prisma.post.findMany({
    where: {
      profileId: profile.id,
    },
    include: {
      savedPosts: {
        where: {
          profileId: req.user.profile.id,
        },
      },
      likes: {
        where: {
          profileId: req.user.profile.id,
        },
      },
      profile: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
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
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const transformedPosts = detailPost.map((post) => ({
    id: post.id,
    caption: post.caption,
    postImage: post.postImage,
    createdAt: post.createdAt,
    profile: post.profile,
    comments: post.comments,
    _count: post._count,
    isLiked: post.likes.length > 0,
    isSaved: post.savedPosts.length > 0,
  }));

  res.status(200).json({
    message: "Success get detail post",
    data: transformedPosts,
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const { error } = postSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ messages: errorMessages });
  }

  const { caption, postImage } = req.body;

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
      profileId: checkProfile.id,
      caption,
      postImage,
    },
  });

  res.status(200).json({
    message: "Success create Post",
    data: createPost,
  });
});

export const editPost = asyncHandler(async (req, res) => {
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

  const editPost = await prisma.post.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });

  if (!editPost) {
    throw new Error("Post not found!");
  }

  res.status(200).json({
    message: "Success edit Post",
    data: editPost,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
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

  const deletePost = await prisma.post.delete({
    where: {
      id: req.params.id,
      profileId: checkProfile.id,
    },
    include: {
      comments: true,
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
