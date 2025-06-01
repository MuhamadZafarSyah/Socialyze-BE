import express from "express";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
import {
  createSnap,
  getSnap,
  getUserSnap,
} from "../controller/snapController.js";
import uploadFile from "../utils/uploadFileHandler.js";

const router = express.Router();

// MENDAPATKAN USER YANG MEMBUAT SNAP
router.get("/users", protectedMiddleware, getUserSnap);

// Mendapatkan semua save postingan
router.get("/:username", protectedMiddleware, getSnap);

// MELAKUKAN SAVE POST BERDASARKAN ID
router.post("/", protectedMiddleware, createSnap);

// ENDPOINT UNTUK FILE UPLOAD POST
router.post(
  "/upload-snap-image",
  protectedMiddleware,
  uploadFile("snapImage", "stories"),
  (req, res) => {
    if (req.file) {
      res.json({
        message: "Snap Image uploaded successfully",
        data: req.uploadedFile,
      });
    } else {
      res.json({
        message: "No snap image uploaded",
        data: null,
      });
    }
  }
);
export default router;
