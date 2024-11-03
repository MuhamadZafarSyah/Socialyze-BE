import express from "express";
import authRoute from "./routes/authRoute.js";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRoute.js";
import commentRouter from "./routes/commentRoute.js";
import followRouter from "./routes/followsRoute.js";
import likeRouter from "./routes/likeRoute.js";
import savePostRouter from "./routes/SavePostRoute.js";
import snapRouter from "./routes/snapRoute.js";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import helmet from "helmet";
import sanitizer from "perfect-express-sanitizer";

const app = express();

// Hapus const port dan app.listen karena Vercel akan menangani ini
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.use(
  sanitizer.clean({
    xss: true,
    noSql: true,
    sql: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.get("/", (req, res, next) => {
  try {
    // kode login
  } catch (error) {
    console.error(" error:", error);
    next(error);
  }
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
async function main() {
  // Seed data jika diperlukan
  console.log("Database connected successfully");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
app.use(errorHandler);
app.use(notFound);

export default app;
