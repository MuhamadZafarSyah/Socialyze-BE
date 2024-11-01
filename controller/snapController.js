import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";
import Joi from "joi";

const prisma = new PrismaClient();

const formatTimeAgo = (date) => {
  const now = new Date();
  const timeago = now.getTime() - date.getTime();

  if (timeago < 1000) {
    return "baru saja";
  }

  const minutes = Math.floor(timeago / (1000 * 60));
  if (minutes < 60) {
    return minutes + "m ago";
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + "h ago";
  }
};

const snapSchema = Joi.object({
  snapImage: Joi.string(),
});

export const getUserSnap = asyncHandler(async (req, res) => {
  const usersWithSnap = await prisma.profile.findMany({
    where: {
      snaps: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
    },
  });

  res.status(200).json({
    message: "Success get user snap",
    data: usersWithSnap,
  });
});

export const getSnap = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const profile = await prisma.profile.findUnique({
    where: {
      username: username,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    res.status(404);
    throw new Error("Profile tidak ditemukan");
  }

  // Hapus snap yang sudah kadaluarsa
  await prisma.snap.deleteMany({
    where: {
      profileId: profile.id,
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  const snaps = await prisma.snap.findMany({
    where: {
      profileId: profile.id,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      profile: {
        select: {
          username: true,
          avatar: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const type = "image";

  const response = snaps.map((snap) => ({
    url: snap.snapImage,
    type,
    header: {
      heading: snap.profile.username,
      subheading: formatTimeAgo(snap.createdAt),

      profileImage: snap.profile.avatar,
    },
  }));

  res.status(200).json(response);
});

export const createSnap = asyncHandler(async (req, res) => {
  const { error } = snapSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ messages: errorMessages });
  }

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
    throw new Error("Profile tidak ditemukan");
  }

  const createSnap = await prisma.snap.create({
    data: {
      snapImage: req.body.snapImage,
      profileId: checkProfile.id,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
  });

  res.status(200).json({
    message: "Success create snap",
    data: createSnap,
  });
});
