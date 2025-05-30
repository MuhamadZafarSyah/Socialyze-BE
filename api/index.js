import express from "express";
import authRoute from "../routes/authRoute.js";
import userRouter from "../routes/userRouter.js";
import postRouter from "../routes/postRoute.js";
import commentRouter from "../routes/commentRoute.js";
import followRouter from "../routes/followsRoute.js";
import likeRouter from "../routes/likeRoute.js";
import savePostRouter from "../routes/SavePostRoute.js";
import snapRouter from "../routes/snapRoute.js";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "../middleware/errorMiddleware.js";
import helmet from "helmet";
import cors from "cors";
import sanitizer from "perfect-express-sanitizer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*", // Untuk development, di production ganti dengan domain frontend Anda
    credentials: true,
  })
);
// Hapus const port dan app.listen karena Vercel akan menangani ini
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.status(200).json({
    message: `Selamat datang di Socialyze kami ${process.env.PATH_FOLDER_UPLOADS}/post" `,
  });
});

app.get("/api/v1/", function (req, res) {
  res.status(200).json({
    message: `Selamat datang di Socialyze kami ${process.env.PATH_FOLDER_UPLOADS}/post" `,
  });
});

app.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});

prisma
  .$connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

// API FOR AUTHENTICATION
app.use("/api/v1/auth", authRoute);

// API FOR PROFILE
app.use("/api/v1/profile", userRouter);

// API FOR ALL POSTS
app.use("/api/v1/posts", postRouter);

// API FOR GET COMMENTS
app.use("/api/v1/comments", commentRouter);

// API FOR FOLLOW
app.use("/api/v1/follow", followRouter);

// API FOR LIKE POST BY USER
app.use("/api/v1/like", likeRouter);

// API FOR SAVE POST BY ID POST
app.use("/api/v1/save", savePostRouter);

app.use("/api/v1/stories", snapRouter);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);
app.use(notFound);

export default app;
