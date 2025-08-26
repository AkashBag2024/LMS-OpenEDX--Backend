import "dotenv/config";
import http from "http";
import app from "./server/app.js";
import connectDB from "./server/config/db.config.js";

// --- Create HTTP Server ---
// We create the server here but won't start it until the DB is connected.
const server = http.createServer(app);

// --- Environment Variables ---
const PORT = process.env.PORT || 8080;

// --- Main Function to Start the Server ---
const startServer = async () => {
  try {
    console.log("Attempting to connect to the database...");
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔗 Access the server at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
};

// --- Graceful Shutdown ---
// This ensures that your server shuts down cleanly when you stop the process.
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
};

// Listen for termination signals
process.on("SIGINT", () => shutdown("SIGINT")); // e.g., Ctrl+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // e.g., `kill` command

// --- Global Error Handlers (Safety Nets) ---
// These catch errors that might otherwise crash your application.
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 UNHANDLED REJECTION! Shutting down...");
  console.error("Reason:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("🚨 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err);
  server.close(() => process.exit(1));
});

// --- Execute Server Start ---
// This is the command that kicks everything off.
startServer();
