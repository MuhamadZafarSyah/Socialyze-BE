import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import { getSavePost, savePost } from "../controller/savePostController.js";

const router = express.Router();

// Mendapatkan semua save postingan
router.get("/", protectedMiddleware, getSavePost);

// MELAKUKAN SAVE POST BERDASARKAN ID
router.post("/:id", protectedMiddleware, savePost);

export default router;
