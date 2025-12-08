import { db } from "@astra/db";
import { markdownToHtml, markdownToTiptap } from "@astra/parser/tiptap";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Sanitize HTML content (basic implementation)
 */
function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

/**
 * Create a new blog post (saved as draft)
 */
export const createCreatePostTool = (workspaceId: string) =>
  createTool({
    id: "create-post",
    description:
      "Create a new blog post. Posts are saved as drafts for review.",
    inputSchema: z.object({
      title: z.string().describe("Title of the blog post"),
      content: z.string().describe("Markdown content of the blog post"),
      description: z
        .string()
        .describe("Short description for SEO (meta description)"),
      categorySlug: z.string().describe("Slug of the category to assign"),
      coverImage: z
        .string()
        .nullable()
        .optional()
        .describe("Cover image URL (from auto-select-image tool or null)"),
      tags: z
        .array(z.string())
        .nullable()
        .optional()
        .transform((v) => v ?? [])
        .describe("Array of tag names to associate"),
    }),

    outputSchema: z.object({
      success: z.boolean(),
      post: z
        .object({
          id: z.string(),
          slug: z.string(),
          title: z.string(),
        })
        .optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const {
          title,
          content,
          description,
          categorySlug,
          coverImage,
          tags: tagNames,
        } = context;

        // Validate category exists
        const category = await db.category.findFirst({
          where: { slug: categorySlug, workspaceId },
        });

        if (!category) {
          return {
            success: false,
            error: `Category '${categorySlug}' not found. Please create it first or use an existing category.`,
          };
        }

        // Find tags if provided
        let tagConnect: { id: string }[] = [];
        if (tagNames.length > 0) {
          const foundTags = await db.tag.findMany({
            where: {
              workspaceId,
              name: { in: tagNames },
            },
          });
          tagConnect = foundTags.map((t: { id: string }) => ({ id: t.id }));
        }

        // Generate unique slug
        const slug = generateSlug(title);

        // Get first author in workspace (default author)
        const author = await db.author.findFirst({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
        });

        if (!author) {
          return {
            success: false,
            error:
              "No author found in workspace. Please create an author first.",
          };
        }

        // Convert markdown to HTML and TipTap JSON
        const htmlContent = await markdownToHtml(content);
        const cleanContent = sanitizeHtml(htmlContent);
        const contentJson = markdownToTiptap(content);

        // Create the post
        const post = await db.post.create({
          data: {
            title,
            slug,
            content: cleanContent,
            contentJson,
            categoryId: category.id,
            status: "draft",
            workspaceId,
            primaryAuthorId: author.id,
            authors: {
              connect: [{ id: author.id }],
            },
            tags: tagConnect.length > 0 ? { connect: tagConnect } : undefined,
            description,
            coverImage: coverImage ?? undefined,
            publishedAt: new Date(),
          },
        });

        return {
          success: true,
          post: { id: post.id, slug: post.slug, title: post.title },
        };
      } catch (error: unknown) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
