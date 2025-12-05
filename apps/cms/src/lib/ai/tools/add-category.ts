import { tool, UIToolInvocation } from "ai";
import { db } from "@astra/db";
import { categorySchema } from "@/lib/validations/workspace";

export const createAddCategoryTool = (workspaceId: string) =>
	tool({
		description: "Create a new category",
		inputSchema: categorySchema,
		execute: async ({ name, slug, description }) => {
			try {
				const existing = await db.category.findFirst({
					where: { slug, workspaceId },
				});
				if (existing) {
					return { error: "Category with this slug already exists" };
				}
				const category = await db.category.create({
					data: {
						name,
						slug,
						description,
						workspaceId,
					},
				});
				return { success: true, category };
			} catch (error: unknown) {
				return { error: error instanceof Error ? error.message : String(error) };
			}
		},
	});

export type AddCategoryUIToolInvocation = UIToolInvocation<ReturnType<typeof createAddCategoryTool>>;
