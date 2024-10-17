import express from "express";
import { login, logout, register } from "../controller/authController.js";

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/logout", logout);

export default router;
