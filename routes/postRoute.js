import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getDetailPost,
  myPosts,
} from "../controller/postContoller.js";
import uploadFile from "../utils/uploadFileHandler.js";

const router = express.Router();

// INI NIATNYA BUAT DI HALAMAN HOME, ATAU MENAMPILKAN SEMUA POSTINGAN
router.get("/allPosts", protectedMiddleware, getAllPosts);

// POSTINGAN DARI USER YANG DI FOLLOW
router.get("/friend-post", protectedMiddleware);

// UNTUK MELIHAT POSTINGAN DIRI SENDIRI
router.get("/my-posts", protectedMiddleware, myPosts);

// UNTUK MELIHAT DETAIL POSTINGAN, BISA BUAT LIHAT DETAIL POSTINGAN DIRI SENDIRI JUGA
router.get("/detail-post/:id", protectedMiddleware, getDetailPost);

// UNTUK BUAT POSTINGAN
router.post("/create-post", protectedMiddleware, createPost);

// DELETE POSTINGAN
router.delete("/delete-post/:id", protectedMiddleware, deletePost);

// ENDPOINT UNTUK FILE UPLOAD POST
router.post(
  "/upload-post-image",
  protectedMiddleware,
  uploadFile("postImage", "post"),
  (req, res) => {
    if (req.uploadedFile) {
      // File berhasil diunggah
      res.json({
        message: "Post Image uploaded successfully",
        data: req.uploadedFile,
      });
    } else {
      res.status(400).json({ error: "Post Image upload failed" });
    }
  }
);
export default router;
