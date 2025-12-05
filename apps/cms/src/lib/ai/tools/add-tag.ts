import { tool, UIToolInvocation } from "ai";
import { db } from "@astra/db";
import { tagSchema } from "@/lib/validations/workspace";

export const createAddTagTool = (workspaceId: string) =>
	tool({
		description: "Create a new tag",
		inputSchema: tagSchema,
		execute: async ({ name, slug, description }) => {
			try {
				const existing = await db.tag.findFirst({
					where: { slug, workspaceId },
				});
				if (existing) {
					return { error: "Tag with this slug already exists" };
				}
				const tag = await db.tag.create({
					data: {
						name,
						slug,
						description,
						workspaceId,
					},
				});
				return { success: true, tag };
			} catch (error: unknown) {
				return { error: error instanceof Error ? error.message : String(error) };
			}
		},
	});

export type AddTagUIToolInvocation = UIToolInvocation<ReturnType<typeof createAddTagTool>>;
