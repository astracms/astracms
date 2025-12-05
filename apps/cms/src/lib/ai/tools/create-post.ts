import { tool, UIToolInvocation } from "ai";
import { z } from "zod";
import { db } from "@astra/db";
import { generateSlug } from "@/utils/string";
import { nanoid } from "nanoid";

export const createCreatePostTool = (workspaceId: string) =>
	tool({
		description: "Create a new post (draft)",
		inputSchema: z.object({
			title: z.string(),
			content: z.string(),
			description: z.string().describe("Short description of the post"),
			categorySlug: z.string().describe("Slug of the category"),
			tags: z.array(z.string()).optional(),
		}),
		execute: async ({ title, content, description, categorySlug, tags: tagNames }) => {
			try {
				const category = await db.category.findFirst({
					where: { slug: categorySlug, workspaceId },
				});

				if (!category) {
					return { error: `Category '${categorySlug}' not found.` };
				}

				let tagConnect: { id: string }[] = [];
				if (tagNames && tagNames.length > 0) {
					const foundTags = await db.tag.findMany({
						where: {
							workspaceId,
							name: { in: tagNames },
						},
					});
					tagConnect = foundTags.map((t) => ({ id: t.id }));
				}

				const slug = `${generateSlug(title)}-${nanoid(6)}`;

				// Get or create author from session context
				// Note: This would need sessionData passed in context
				// For now, we'll return an error if no author is found
				const author = await db.author.findFirst({
					where: { workspaceId },
					orderBy: { createdAt: "desc" },
				});

				if (!author) {
					return {
						error: "No author found. Please create an author first.",
					};
				}

				const post = await db.post.create({
					data: {
						title,
						slug,
						content,
						contentJson: JSON.stringify({ type: "doc", content: [] }),
						categoryId: category.id,
						status: "draft",
						workspaceId,
						primaryAuthorId: author.id,
						authors: {
							connect: [{ id: author.id }],
						},
						tags: tagConnect.length > 0 ? { connect: tagConnect } : undefined,
						description,
						publishedAt: new Date(),
					},
				});
				return {
					success: true,
					post: { id: post.id, slug: post.slug, title: post.title },
				};
			} catch (error: unknown) {
				return { error: error instanceof Error ? error.message : String(error) };
			}
		},
	});

export type CreatePostUIToolInvocation = UIToolInvocation<ReturnType<typeof createCreatePostTool>>;
