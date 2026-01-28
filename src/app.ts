import express from "express";
import { postRouter } from "./modules/post/post.router";
const app = express();
// const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/posts", postRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;