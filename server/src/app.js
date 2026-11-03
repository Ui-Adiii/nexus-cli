import { toNodeHandler } from "better-auth/node";
import express from "express"
import { auth } from "./lib/auth.js";
import cors from "cors";

const app = express()
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true, 
  }),
);


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json())


app.get("/device", async (req, res) => {
  const { user_code } = req.query;
  res.redirect(`http://localhost:3000/device?user_code=${user_code}`);
});

export default app