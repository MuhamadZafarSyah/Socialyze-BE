import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import {
  followUser,
  getUserFollowers,
  getUserFollowing,
  unfollowUser,
} from "../controller/followsController.js";

const router = express.Router();

// UNTUK FOLLOW USER
router.post("/:id", protectedMiddleware, followUser);

// UNTUK UNFOLLOW USER
router.delete("/unfollow/:id", protectedMiddleware, unfollowUser);

// UNTUK MENDAPATKAN SEMUA FOLLOWERS ORANG LAIN
router.get("/:username/followers", protectedMiddleware, getUserFollowers);

router.get("/:username/following", protectedMiddleware, getUserFollowing);

export default router;
