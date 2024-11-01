import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";
const prisma = new PrismaClient();

// Fungsi untuk follow user
export const followUser = asyncHandler(async (req, res) => {
  const { id: profileYgMauDiFollow } = req.params;

  if (!profileYgMauDiFollow) {
    res.status(404);
    throw new Error("Profil tidak ditemukan");
  }

  if (profileYgMauDiFollow === req.user.profile.id) {
    res.status(400);
    throw new Error("Anda tidak diizinkan untuk mengikuti diri sendiri");
  }

  if (!req.user.profile.id) {
    res.status(401);
    throw new Error("Tidak diizinkan, profil pengguna tidak ditemukan");
  }

  const checkFollow = await prisma.follow.findFirst({
    where: {
      followingProfileId: req.user.profile.id,
      followedProfileId: profileYgMauDiFollow,
    },
  });

  if (checkFollow) {
    res.status(400);
    throw new Error("Anda sudah mengikuti user ini");
  }
  const follow = await prisma.follow.create({
    data: {
      followingProfileId: req.user.profile.id,
      followedProfileId: profileYgMauDiFollow,
    },
  });

  res.status(200).json({
    message: "Success follow user",
    data: follow,
  });
});

// Fungsi untuk unfollow user
export const unfollowUser = asyncHandler(async (req, res) => {
  const { id: profileId } = req.params;

  if (!req.user.profile.id) {
    res.status(401);
    throw new Error("Tidak diizinkan, profil pengguna tidak ditemukan");
  }

  if (profileId === req.user.profile.id) {
    res.status(400);
    throw new Error("Anda tidak diizinkan untuk unfollow diri sendiri");
  }

  const checkFollow = await prisma.follow.findFirst({
    where: {
      followingProfileId: req.user.profile.id,
      followedProfileId: profileId,
    },
  });

  if (!checkFollow) {
    res.status(404);
    throw new Error("Anda tidak mengikuti user ini");
  }

  await prisma.follow.deleteMany({
    where: {
      followingProfileId: req.user.profile.id,
      followedProfileId: profileId,
    },
  });

  res.status(200).json({ message: "Successfully unfollowed user" });
});

export const getUserFollowers = asyncHandler(async (req, res) => {
  const checkProfile = await prisma.profile.findFirst({
    where: {
      username: req.params.username,
    },
  });

  if (!checkProfile) {
    res.status(401);
    throw new Error("Tidak diizinkan, profil pengguna tidak ditemukan");
  }

  const followers = await prisma.follow.findMany({
    where: {
      followedProfileId: checkProfile.id,
    },
    include: {
      followingProfile: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
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
      },
    },
  });

  // Format response data
  const formattedFollowers = followers.map((follow) => ({
    followerId: follow.followingProfile.user.id,
    email: follow.followingProfile.user.email,
    name: follow.followingProfile.name,
    username: follow.followingProfile.username,
    avatar: follow.followingProfile.avatar,
  }));

  res.status(200).json({
    message: "Success get my followers",
    data: formattedFollowers,
  });
});

export const getUserFollowing = asyncHandler(async (req, res) => {
  const checkProfile = await prisma.profile.findFirst({
    where: {
      username: req.params.username,
    },
  });

  if (!checkProfile) {
    res.status(401);
    throw new Error("Tidak diizinkan, profil pengguna tidak ditemukan");
  }
  if (!req.user.profile.id) {
    res.status(401);
    throw new Error("Tidak diizinkan, profil pengguna tidak ditemukan");
  }

  // Query untuk mendapatkan siapa saja yang mengikuti user (followers)
  const following = await prisma.follow.findMany({
    where: {
      followingProfileId: checkProfile.id,
    },
    include: {
      followedProfile: {
        include: {
          user: {
            select: {
              id: true,
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
      },
    },
  });

  // Format response data
  const formattedFollowing = following.map((follow) => ({
    followingId: follow.followedProfile.user.id,
    email: follow.followedProfile.user.email,
    name: follow.followedProfile.name,
    username: follow.followedProfile.username,
    avatar: follow.followedProfile.avatar,
  }));

  res.status(200).json({
    message: "Success get my following",
    data: formattedFollowing,
  });
});

export const getFollowStatus = asyncHandler(async (req, res) => {
  const { id: profileId } = req.params;

  const followStatus = await prisma.follow.findFirst({
    where: {
      followingProfileId: req.user.profile.id,
      followedProfileId: profileId,
    },
  });

  res.json({ isFollowing: !!followStatus });
});
