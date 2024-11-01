import asyncHandler from "./asyncHandler.js ";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: {
          id: decode.id,
        },
        include: {
          profile: true,
        },
      });

      if (!user) {
        res.status(401);
        throw new Error("Tidak diizinkan, pengguna tidak ditemukan");
      }

      req.user = user;
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
