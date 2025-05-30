import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import {
  createPost,
  deletePost,
  editPost,
  getAllPosts,
  getDetailPost,
} from "../controller/postContoller.js";
import uploadFile from "../utils/uploadFileHandler.js";

const router = express.Router();

// INI NIATNYA BUAT DI HALAMAN HOME, ATAU MENAMPILKAN SEMUA POSTINGAN
router.get("/allPosts", protectedMiddleware, getAllPosts);

// UNTUK EDIT POSTINGAN DIRI SENDITI
router.patch("/edit-post/:id", protectedMiddleware, editPost);

// UNTUK MELIHAT DETAIL POSTINGAN, BISA BUAT LIHAT DETAIL POSTINGAN DIRI SENDIRI JUGA
router.get("/detail-post/:username", protectedMiddleware, getDetailPost);

// UNTUK BUAT POSTINGAN
router.post("/create-post", protectedMiddleware, createPost);

// DELETE POSTINGAN
router.delete("/delete-post/:id", protectedMiddleware, deletePost);

// ENDPOINT UNTUK FILE UPLOAD POST
router.post(
  "/upload-post-image",
  protectedMiddleware,
  uploadFile("postImage", "socialyze/uploads/post"),
  (req, res) => {
    if (req.file) {
      res.json({
        message: "Post Image uploaded successfully",
        data: req.uploadedFile,
      });
    } else {
      // Jika tidak ada file yang diupload, kirim response kosong
      res.json({
        message: "No post image uploaded",
        data: null,
      });
    }
  }
);
export default router;
