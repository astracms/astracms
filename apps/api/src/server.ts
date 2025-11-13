import { serve } from "@hono/node-server";
import dotenv from "dotenv";
import app from "./app";
import type { AppEnv } from "./types/hono";

// Load environment variables
dotenv.config();

// Extend Hono context with env
app.use("*", async (c, next) => {
  // Set environment variables in context
  c.set("env", {
    DATABASE_URL: process.env.DATABASE_URL || "",
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "8000",
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    API_VERSION: process.env.API_VERSION || "v1",
  });

  await next();
});

// Get port from environment or default to 8000
const port = parseInt(process.env.PORT || "8000", 10);

// Create and start server
const server = serve({
  fetch: app.fetch,
  port,
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log("\n🔄 Starting graceful shutdown...");

  // Close server
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

// Log startup information
console.log(`
🚀 AstraCMS API Server
====================
Environment: ${process.env.NODE_ENV || "development"}
Port: ${port}
Version: ${process.env.API_VERSION || "v1"}
====================
`);

if (process.env.NODE_ENV === "development") {
  console.log(`
📝 API Documentation:
- Health: http://localhost:${port}/
- Status: http://localhost:${port}/status
- API Base: http://localhost:${port}/v1

Available endpoints:
- GET /v1/:workspaceId/authors
- GET /v1/:workspaceId/categories
- GET /v1/:workspaceId/posts
- GET /v1/:workspaceId/tags
`);
}

console.log(`✨ Server is running on port ${port}`);

// Export for testing
export { app };
export default server;
