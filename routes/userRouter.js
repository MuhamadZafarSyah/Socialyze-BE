import express from "express";
import {
  createProfile,
  editProfile,
  getAllUser,
  myProfile,
  profileDetail,
} from "../controller/userController.js";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import uploadFile from "../utils/uploadFileHandler.js";

const router = express.Router();

// NANTI BAKAL KHUSUS ADMIN UNTUK MENDAPATKAN SELURUH DATA USER
router.get("/getalluser", protectedMiddleware, getAllUser);

// UNTUK USER BISA MENGECEK PROFILE ORANG LAIN
router.get("/profile-detail/:id", protectedMiddleware, profileDetail);

// UNTUK USER MENGETAHUI DATA DIRI
router.get("/my-profile", protectedMiddleware, myProfile);

// SETELAH LOGIN USER DIPAKSA UNTUK BUAT PROFILE AGAR DAPAT MENERUSKAN
router.post("/create-profile", protectedMiddleware, createProfile);

// UNTUK UPDATE PROFILE DIRI SAYA SENDIRI
router.put("/edit-profile", protectedMiddleware, editProfile);

// ENDPOINT UNTUK FILE UPLOAD
router.post(
  "/upload-profile-picture",
  protectedMiddleware,
  uploadFile("avatar", "profile-picture"),
  (req, res) => {
    if (req.uploadedFile) {
      // File berhasil diunggah
      res.json({
        message: "Avatar uploaded successfully",
        data: req.uploadedFile,
      });
    } else {
      res.status(400).json({ error: "Avatar upload failed" });
    }
  }
);
export default router;
