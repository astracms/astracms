import { OpenAPIHono } from "@hono/zod-openapi";
import { cache } from "hono/cache";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";
import { analytics } from "./middleware/analytics";
import { apiKeyAuth } from "./middleware/api-key-auth";
import { ratelimit } from "./middleware/ratelimit";
import authorsRoutes from "./routes/authors";
import categoriesRoutes from "./routes/categories";
import postsRoutes from "./routes/posts";
import tagsRoutes from "./routes/tags";
import {
  v2AuthorsRoutes,
  v2CategoriesRoutes,
  v2PostsRoutes,
  v2TagsRoutes,
} from "./routes/v2";
import type { Env } from "./types/env";

const app = new OpenAPIHono<{ Bindings: Env }>();
const v1 = new OpenAPIHono<{ Bindings: Env }>();
const v2 = new OpenAPIHono<{ Bindings: Env }>();

const staleTime = 3600;

// CORS Middleware - Allow cross-origin requests from any origin
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["Content-Length", "X-Request-Id"],
    maxAge: 86_400, // 24 hours
  })
);

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

// Cache key generator that includes query parameters for proper caching of different filter combinations
// IMPORTANT: The Cache API requires absolute URLs, so we must return the full URL (not just the path)
const cacheKeyGenerator = (c: { req: { url: string } }) => {
  const url = new URL(c.req.url);
  // Sort query params for consistent cache keys
  const sortedParams = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  // Return the absolute URL with sorted params
  return `${url.origin}${url.pathname}${sortedParams ? `?${sortedParams}` : ""}`;
};

// V1 Middleware (workspace ID in URL)
app.use("/v1/:workspaceId/*", ratelimit());
app.use("/v1/:workspaceId/*", analytics());
app.use(
  "/v1/:workspaceId/*",
  cache({
    cacheName: "astracms-v1",
    // Blog content doesn't change frequently - cache for 10 minutes
    // stale-while-revalidate allows serving stale content while fetching fresh
    cacheControl: "max-age=600, stale-while-revalidate=300, public",
    // Vary by Accept header for content negotiation (JSON vs other formats)
    vary: ["Accept"],
    // Include query params in cache key for proper filter/pagination caching
    keyGenerator: cacheKeyGenerator,
  })
);

// V2 Middleware (API key authentication)
app.use("/v2/*", apiKeyAuth());
app.use("/v2/*", ratelimit());
app.use("/v2/*", analytics());
app.use(
  "/v2/*",
  cache({
    cacheName: "astracms-v2",
    cacheControl: "max-age=600, stale-while-revalidate=300, public",
    vary: ["Accept", "Authorization"],
    keyGenerator: cacheKeyGenerator,
  })
);

app.use(trimTrailingSlash());

// Workspace redirect logic
app.use("/:workspaceId/*", async (c, next) => {
  const path = c.req.path;
  const workspaceId = c.req.param("workspaceId");
  // Skip v1, v2, and root routes from redirect logic
  if (
    path.startsWith("/v1/") ||
    path.startsWith("/v2/") ||
    path === "/" ||
    path === "/status"
  ) {
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

// Mount v1 routes (workspace ID in URL)
v1.route("/:workspaceId/tags", tagsRoutes);
v1.route("/:workspaceId/categories", categoriesRoutes);
v1.route("/:workspaceId/posts", postsRoutes);
v1.route("/:workspaceId/authors", authorsRoutes);

// Mount v2 routes (API key authentication)
v2.route("/tags", v2TagsRoutes);
v2.route("/categories", v2CategoriesRoutes);
v2.route("/posts", v2PostsRoutes);
v2.route("/authors", v2AuthorsRoutes);

app.route("/v1", v1);
app.route("/v2", v2);

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    version: "2.0.0",
    title: "AstraCMS API",
    description: `
The AstraCMS API provides programmatic access to your content. 

## API Versions

- **V1** (\`/v1/{workspaceId}/...\`): Uses workspace ID in the URL path
- **V2** (\`/v2/...\`): Uses API key authentication via \`Authorization: Bearer\` header (recommended)

## Rate Limiting

All API endpoints are rate limited. When you exceed the limit, you'll receive a 429 response.
    `.trim(),
    contact: {
      name: "AstraCMS Support",
      url: "https://www.astracms.dev",
      email: "support@astracms.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "https://api.astracms.dev",
      description: "Production API",
    },
  ],
  tags: [
    { name: "Posts", description: "Blog posts and articles" },
    { name: "Categories", description: "Post categories" },
    { name: "Tags", description: "Post tags" },
    { name: "Authors", description: "Content authors" },
  ],
});

// OpenAPI security schemes (registered separately for proper component generation)
app.openAPIRegistry.registerComponent("securitySchemes", "ApiKeyAuth", {
  type: "http",
  scheme: "bearer",
  description:
    "API key for V2 endpoints. Use format: Bearer {your_api_key}. Get your key from the AstraCMS dashboard.",
});

export default app;
