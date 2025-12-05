import { db } from "@astra/db";
import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";
import { generateSlug } from "@/utils/string";

export const createUpdatePostTool = (workspaceId: string) =>
  tool({
    description: "Update an existing post",
    inputSchema: z.object({
      slug: z.string().describe("The slug of the post to update"),
      title: z.string().optional(),
      content: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["published", "draft"]).optional(),
      categorySlug: z.string().optional().describe("New category slug"),
      tags: z.array(z.string()).optional().describe("List of tag names to set"),
    }),
    execute: async ({
      slug,
      title,
      content,
      description,
      status,
      categorySlug,
      tags: tagNames,
    }) => {
      try {
        const existingPost = await db.post.findFirst({
          where: { slug, workspaceId },
        });

        if (!existingPost) {
          return { error: `Post with slug '${slug}' not found.` };
        }

        const data: Record<string, any> = {};
        if (title) {
          data.title = title;
          // Optionally update slug if title changes? better not to change slug automatically on update unless requested.
        }
        if (content) {
          data.content = content;
          // Assuming contentJson update logic is complex or handled by editor, but for AI text update:
          data.contentJson = JSON.stringify({
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: content }] },
            ],
          });
        }
        if (description) data.description = description;
        if (status) data.status = status;
        if (status === "published" && existingPost.status !== "published") {
          data.publishedAt = new Date();
        }

        if (categorySlug) {
          const category = await db.category.findFirst({
            where: { slug: categorySlug, workspaceId },
          });
          if (!category) {
            return { error: `Category '${categorySlug}' not found.` };
          }
          data.categoryId = category.id;
        }

        if (tagNames) {
          const foundTags = await db.tag.findMany({
            where: {
              workspaceId,
              name: { in: tagNames },
            },
          });
          // Use set to replace existing tags with new list
          data.tags = {
            set: foundTags.map((t) => ({ id: t.id })),
          };
        }

        const updatedPost = await db.post.update({
          where: { id: existingPost.id },
          data,
        });

        return {
          success: true,
          post: {
            id: updatedPost.id,
            slug: updatedPost.slug,
            title: updatedPost.title,
            status: updatedPost.status,
          },
        };
      } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });

export type UpdatePostUIToolInvocation = UIToolInvocation<
  ReturnType<typeof createUpdatePostTool>
>;
