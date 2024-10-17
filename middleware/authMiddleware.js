import { PrismaClient } from "@prisma/client";
import asyncHandler from "./asyncHandler.js ";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: {
          id: decode.id,
        },
      });
      // req.user = await User.findById(decode.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Tidak diizinkan, token gagal");
    }
  } else {
    res.status(401).json({ message: "Tidak diizinkan, tidak ada token" });
  }
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Tidak diizinkan");
  }
});
