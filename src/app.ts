import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import documentRoutes from "./routes/document.routes";
import tagsRoutes from "./routes/tag.routes";
import path from "path";

dotenv.config();

connectDB();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/tags", tagsRoutes);
app.use("/api/documents", documentRoutes);

export default app;
