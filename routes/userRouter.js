import express from "express";
import {
  createProfile,
  editProfile,
  getAllUser,
  profileDetail,
} from "../controller/userController.js";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import uploadFile from "../utils/uploadFileHandler.js";

const router = express.Router();

// NANTI BAKAL KHUSUS ADMIN UNTUK MENDAPATKAN SELURUH DATA USER
router.get("/users", getAllUser);

// UNTUK USER BISA MENGECEK PROFILE ORANG LAIN
router.get("/:username", protectedMiddleware, profileDetail);

// SETELAH LOGIN USER DIPAKSA UNTUK BUAT PROFILE AGAR DAPAT MENERUSKAN
router.post("/create-profile", protectedMiddleware, createProfile);

// UNTUK UPDATE PROFILE DIRI SAYA SENDIRI
router.put("/edit-profile", protectedMiddleware, editProfile);

// ENDPOINT UNTUK FILE UPLOAD
router.post(
  "/upload-profile-picture",
  protectedMiddleware,
  uploadFile("avatar", process.env.PATH_FOLDER_UPLOADS + "/profile-picture"),
  (req, res) => {
    if (req.file) {
      res.json({
        message: "Avatar uploaded successfully",
        data: req.uploadedFile,
      });
    } else {
      res.json({
        message: "No avatar uploaded",
        data: null,
      });
    }
  }
);
export default router;
