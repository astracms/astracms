import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Create a new tag for organizing blog content
 */
export const createAddTagTool = (workspaceId: string) =>
  createTool({
    id: "add-tag",
    description: "Create a new tag for organizing blog posts",
    inputSchema: z.object({
      name: z.string().describe("Display name of the tag"),
      slug: z.string().describe("URL-friendly slug (lowercase with hyphens)"),
      description: z
        .string()
        .nullable()
        .optional()
        .describe("Optional description"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      tag: z
        .object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
        })
        .optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const existing = await db.tag.findFirst({
          where: { slug: context.slug, workspaceId },
        });

        if (existing) {
          return {
            success: false,
            error: `Tag with slug '${context.slug}' already exists`,
          };
        }

        const tag = await db.tag.create({
          data: {
            name: context.name,
            slug: context.slug,
            description: context.description,
            workspaceId,
          },
        });

        return {
          success: true,
          tag: { id: tag.id, name: tag.name, slug: tag.slug },
        };
      } catch (error: unknown) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
