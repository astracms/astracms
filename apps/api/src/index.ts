import { serve } from "@hono/node-server";

import { Hono } from "hono";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { analytics } from "./middleware/analytics";
import { ratelimit } from "./middleware/ratelimit";
import authorsRoutes from "./routes/authors";
import categoriesRoutes from "./routes/categories";
import postsRoutes from "./routes/posts";
import tagsRoutes from "./routes/tags";
import type { AppEnv } from "./types/hono";

const app = new Hono<AppEnv>();
const v1 = new Hono<AppEnv>();

const staleTime = 3600;

// Global Middleware
app.use("*", async (c, next) => {
  await next();
  const method = c.req.method;
  // Make sure we only set the Cache-Control header for GET and HEAD requests
  // and only if the response status is in the 2xx or 3xx range.
  if (method === "GET" || method === "HEAD") {
    const status = c.res.status ?? 200;
    if (status >= 200 && status < 400) {
      const cc = c.res.headers.get("Cache-Control") ?? "";
      const hasNoStore = /\bno-store\b/i.test(cc);
      const hasSIE = /\bstale-if-error\s*=\s*\d+\b/i.test(cc);
      // If we already set a cache control header with no-store or stale-if-error, skip setting it again
      if (!hasNoStore && !hasSIE) {
        const value = cc
          ? `${cc}, stale-if-error=${staleTime}`
          : `stale-if-error=${staleTime}`;
        c.header("Cache-Control", value);
      }
    }
  }
});

app.use("/v1/:workspaceId/*", ratelimit());
app.use("/v1/:workspaceId/*", analytics());
app.use(trimTrailingSlash());
app.use(logger());

// Workspace redirect logic
app.use("/:workspaceId/*", async (c, next) => {
  const path = c.req.path;
  const workspaceId = c.req.param("workspaceId");
  if (path.startsWith("/v1/") || path === "/" || path === "/status") {
    return next();
  }

  const workspaceRoutes = ["/tags", "/categories", "/posts", "/authors"];
  const isWorkspaceRoute = workspaceRoutes.some(
    (route) =>
      path === `/${workspaceId}${route}` ||
      path.startsWith(`/${workspaceId}${route}/`)
  );

  if (isWorkspaceRoute) {
    const url = new URL(c.req.url);
    url.pathname = `/v1${path}`;
    return Response.redirect(url.toString(), 308);
  }
  return next();
});

// Health
app.get("/", (c) => c.text("Hello from AstraCMS"));
app.get("/status", (c) => c.json({ status: "ok" }));

// Mount routes
v1.route("/:workspaceId/tags", tagsRoutes);
v1.route("/:workspaceId/categories", categoriesRoutes);
v1.route("/:workspaceId/posts", postsRoutes);
v1.route("/:workspaceId/authors", authorsRoutes);

app.route("/v1", v1);

// Get port from environment or default to 8000
const port = Number.parseInt(process.env.PORT || "8000", 10);

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
  }, 10_000);
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
