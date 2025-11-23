/**
 * V2 API Routes
 *
 * These routes use API key authentication instead of workspace ID in the URL.
 * The workspaceId is extracted from the authenticated API key and injected
 * into the request params, allowing the v1 route handlers to work seamlessly.
 */

import { OpenAPIHono } from "@hono/zod-openapi";
import { requireScope } from "../../middleware/api-key-auth";
import authorsRoutes from "../authors";
import categoriesRoutes from "../categories";
import postsRoutes from "../posts";
import tagsRoutes from "../tags";
import type { Env } from "../../types/env";

/**
 * Create a route adapter that injects workspaceId from API key context
 * into request params before passing to v1 route handlers
 * @param v1Route - The v1 route handler to adapt
 * @param requiredScope - The scope required to access this resource (e.g., "posts:read")
 */
function createV2RouteAdapter(
	v1Route: OpenAPIHono<{ Bindings: Env }>,
	requiredScope: string,
) {
	const adapter = new OpenAPIHono<{ Bindings: Env }>();

	// Apply scope validation first
	adapter.use("*", requireScope(requiredScope));

	// Forward all routes from v1 to v2 with context injection
	adapter.use("*", async (c, next) => {
		// Get workspaceId from context (set by apiKeyAuth middleware)
		const workspaceId = c.get("workspaceId");

		if (!workspaceId) {
			return c.json(
				{
					error: "Unauthorized",
					message: "No workspace context found. Please authenticate with a valid API key.",
				},
				401,
			);
		}

		// Inject workspaceId into the request params
		// This allows v1 route handlers to work with v2 authenticated requests
		c.req.param = (key?: string) => {
			if (key === "workspaceId") {
				return workspaceId;
			}
			// For other params, use the original param function
			return c.req.param(key);
		};

		await next();
	});

	// Mount the v1 routes
	adapter.route("/", v1Route);

	return adapter;
}

// Create v2 route adapters with scope enforcement
export const v2PostsRoutes = createV2RouteAdapter(postsRoutes, "posts:read");
export const v2CategoriesRoutes = createV2RouteAdapter(
	categoriesRoutes,
	"categories:read",
);
export const v2TagsRoutes = createV2RouteAdapter(tagsRoutes, "tags:read");
export const v2AuthorsRoutes = createV2RouteAdapter(authorsRoutes, "authors:read");
