import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import { likePost } from "../controller/likeController.js";

const router = express.Router();

// UNTUK LIKE POSTINGAN BERDASARKAN ID POSTINGAN
router.post("/:id", protectedMiddleware, likePost);

export default router;
