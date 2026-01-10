import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes.js";

const app = express();

// middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Debug middleware to log all requests (before routes)
app.use("/api", (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// mount all routes under /api
app.use("/api", routes);

// health check (TEST THIS IN BROWSER)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler (MUST be last)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
