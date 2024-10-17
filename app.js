import express from "express";
import { PrismaClient } from "@prisma/client";
import authRoute from "./routes/authRoute.js";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRoute.js";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
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

// CONNECT DATABASE
prisma.$connect(process.env.DATABASE, {}).then(() => {
  console.log("Berhasil Connect");
});

async function main() {}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

app.use(errorHandler);
app.use(notFound);
