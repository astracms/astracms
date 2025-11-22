import { OpenAPIHono } from "@hono/zod-openapi";
import { trimTrailingSlash } from "hono/trailing-slash";
import { analytics } from "./middleware/analytics";
import { ratelimit } from "./middleware/ratelimit";
import authorsRoutes from "./routes/authors";
import categoriesRoutes from "./routes/categories";
import postsRoutes from "./routes/posts";
import tagsRoutes from "./routes/tags";
import type { Env } from "./types/env";

const app = new OpenAPIHono<{ Bindings: Env }>();
const v1 = new OpenAPIHono<{ Bindings: Env }>();

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
app.get("/", (c) => c.text("Hello From astracms : visit  docs.astracms.dev"));
app.get("/status", (c) => c.json({ status: "ok" }));

// Mount routes
v1.route("/:workspaceId/tags", tagsRoutes);
v1.route("/:workspaceId/categories", categoriesRoutes);
v1.route("/:workspaceId/posts", postsRoutes);
v1.route("/:workspaceId/authors", authorsRoutes);

app.route("/v1", v1);

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Astra CMS API",
    description: "API for Astra CMS content management system",
  },
});

export default app;
