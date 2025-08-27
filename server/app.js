import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Routes imports
import adminRoutes from "./routes/admin.route.js";

// This is necessary for ES modules to correctly resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security middleware
app.use(helmet());

// 2. CORS middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));

// 3. Body Parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// 4. logger middleware
if (process.env.REQUEST_LOGGING_ENABLED === "true") {
  const logDirectory = path.join(__dirname, "..", "logs");

  fs.mkdirSync(logDirectory, { recursive: true });

  const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    { flags: "a" }
  );

  app.use(morgan("dev"));

  app.use(morgan("combined", { stream: accessLogStream }));
}

// Routes initialize
app.use("/api/admin", adminRoutes);

// 5. Healthcheck route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy and running!",
  });
});

// 1. 404 Not Found Handler
// This will catch any request that doesn't match a route above.
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// 2. General Error Handler
// This is the final stop for all errors.
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "An unexpected error occurred.",
    ...(process.env.SHOW_ERROR_STACK === "true" && { stack: err.stack }),
  });
});

export default app;
