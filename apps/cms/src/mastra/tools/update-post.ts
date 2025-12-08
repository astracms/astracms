import { db } from "@astra/db";
import { markdownToHtml, markdownToTiptap } from "@astra/parser/tiptap";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Sanitize HTML content (basic implementation)
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

/**
 * Update an existing blog post
 */
export const createUpdatePostTool = (workspaceId: string) =>
  createTool({
    id: "update-post",
    description:
      "Update an existing blog post. Can modify title, content, description, status, category, or tags.",
    inputSchema: z.object({
      slug: z.string().describe("The slug of the post to update"),
      title: z.string().optional().describe("New title"),
      content: z.string().optional().describe("New markdown content"),
      description: z
        .string()
        .nullable()
        .optional()
        .describe("New SEO description"),
      status: z.enum(["published", "draft"]).optional().describe("New status"),
      categorySlug: z.string().optional().describe("New category slug"),
      tags: z
        .array(z.string())
        .nullable()
        .optional()
        .describe("New list of tag names (replaces existing)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      post: z
        .object({
          id: z.string(),
          slug: z.string(),
          title: z.string(),
          status: z.string(),
        })
        .optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const {
          slug,
          title,
          content,
          description,
          status,
          categorySlug,
          tags: tagNames,
        } = context;

        // Find existing post
        const existingPost = await db.post.findFirst({
          where: { slug, workspaceId },
        });

        if (!existingPost) {
          return {
            success: false,
            error: `Post with slug '${slug}' not found.`,
          };
        }

        const data: Record<string, unknown> = {};

        // Update title
        if (title) {
          data.title = title;
        }

        // Update content with markdown conversion
        if (content) {
          const htmlContent = await markdownToHtml(content);
          data.content = sanitizeHtml(htmlContent);
          data.contentJson = markdownToTiptap(content);
        }

        // Update description
        if (description) {
          data.description = description;
        }

        // Update status
        if (status) {
          data.status = status;
          // Set publishedAt when first publishing
          if (status === "published" && existingPost.status !== "published") {
            data.publishedAt = new Date();
          }
        }

        // Update category
        if (categorySlug) {
          const category = await db.category.findFirst({
            where: { slug: categorySlug, workspaceId },
          });
          if (!category) {
            return {
              success: false,
              error: `Category '${categorySlug}' not found.`,
            };
          }
          data.categoryId = category.id;
        }

        // Update tags (replaces existing)
        if (tagNames) {
          const foundTags = await db.tag.findMany({
            where: {
              workspaceId,
              name: { in: tagNames },
            },
          });
          data.tags = {
            set: foundTags.map((t: { id: string }) => ({ id: t.id })),
          };
        }

        // Perform update
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
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
