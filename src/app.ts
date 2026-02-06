import express from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from 'cors';


const app = express();
// const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors({
  origin: process.env.APP_URL || "http://localhost:4500 ",
  credentials: true

}))

app.use("/posts", postRouter);
app.all('/api/auth/*splat', toNodeHandler(auth));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;