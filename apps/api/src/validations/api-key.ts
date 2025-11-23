import { z } from "zod";

export const apiKeyScopeEnum = z.enum([
	"posts:read",
	"posts:write",
	"categories:read",
	"categories:write",
	"tags:read",
	"tags:write",
	"authors:read",
	"authors:write",
	"media:read",
	"media:write",
]);

export type ApiKeyScope = z.infer<typeof apiKeyScopeEnum>;
