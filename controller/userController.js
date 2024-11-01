import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";

const prisma = new PrismaClient();

export const getAllUser = asyncHandler(async (req, res) => {
  const users = await prisma.profile.findMany();
  res.status(200).json({
    message: "Success get all profile user",
    data: users,
  });
});

export const profileDetail = asyncHandler(async (req, res) => {
  const getUser = await prisma.profile.findUnique({
    where: {
      username: req.params.username,
    },
    include: {
      followers: {
        where: {
          followingProfileId: req.user.profile.id,
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
      posts: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          postImage: true,
        },
      },
    },
  });

  if (!getUser) {
    res.status(404);
    throw new Error("Profile user tidak ditemukan");
  }

  const profileData = {
    ...getUser,
    isFollowing: getUser.followers.length > 0,
    followers: undefined,
  };

  res.status(200).json({
    message: "Success get detail profile user",
    data: profileData,
  });
});

export const createProfile = asyncHandler(async (req, res) => {
  const { name, username, gender, avatar, bio } = req.body;

  const checkProfile = await prisma.profile.findFirst({
    where: {
      userId: req.user.id,
    },
  });

  if (checkProfile) {
    res.status(400).json({ message: "User already have profile" });
  }

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
      avatar,
      bio,
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
    select: {
      id: true,
    },
  });

  if (!checkProfile) {
    res.status(404);
    throw new Error("Anda Dilarang Untuk Melakukan Aksi ini");
  }

  const { username, ...updateData } = req.body;

  const existingUser = await prisma.profile.findUnique({
    where: { username },
  });

  if (existingUser && existingUser.id !== checkProfile.id) {
    throw new Error("Username sudah dipakai");
  }

  const updatedProfile = await prisma.profile.update({
    where: {
      id: checkProfile.id,
    },
    data: { ...updateData, username: username || checkProfile.username },
  });

  res.status(200).json({
    message: "Success edit profile",
    data: updatedProfile,
  });
});
