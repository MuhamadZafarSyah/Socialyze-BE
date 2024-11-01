import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import {
  createComment,
  deleteComment,
} from "../controller/commentController.js";

const router = express.Router();

// UNTUK MEMBUAT KOMENTAR BERDASARKAN ID POSTINGAN
router.post("/create-comment/:id", protectedMiddleware, createComment);

// UNTUK DELETE KOMENTAR BERDASARKAN ID KOMENTAR
router.delete("/delete-comment/:id", protectedMiddleware, deleteComment);
export default router;
