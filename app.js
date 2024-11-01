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
import cors from "cors";
const app = express();
const port = 3000;

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.status(200).json("Welcome To Socialyze");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
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

app.use(errorHandler);
app.use(notFound);
