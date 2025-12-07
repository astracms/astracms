/**
 * V2 API Routes
 *
 * These routes use API key authentication instead of workspace ID in the URL.
 * The workspaceId is extracted from the authenticated API key and set in context.
 */

import { OpenAPIHono } from "@hono/zod-openapi";
import { requireScope } from "../../middleware/api-key-auth";
import type { Env, Variables } from "../../types/env";
import v2Authors from "./authors";
import v2Categories from "./categories";
import v2Posts from "./posts";
import v2Tags from "./tags";

/**
 * Create a V2 route wrapper that applies scope validation
 */
function createV2RouteWithScope(
  route: OpenAPIHono<{ Bindings: Env; Variables: Variables }>,
  scope: "posts:read" | "categories:read" | "tags:read" | "authors:read"
) {
  const wrapper = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();
  wrapper.use("*", requireScope(scope));
  wrapper.route("/", route);
  return wrapper;
}

// Export V2 routes with scope enforcement
export const v2PostsRoutes = createV2RouteWithScope(v2Posts, "posts:read");
export const v2CategoriesRoutes = createV2RouteWithScope(
  v2Categories,
  "categories:read"
);
export const v2TagsRoutes = createV2RouteWithScope(v2Tags, "tags:read");
export const v2AuthorsRoutes = createV2RouteWithScope(
  v2Authors,
  "authors:read"
);
