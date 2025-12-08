import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Create a new category for organizing blog content
 */
export const createAddCategoryTool = (workspaceId: string) =>
  createTool({
    id: "add-category",
    description: "Create a new category for organizing blog posts",
    inputSchema: z.object({
      name: z.string().describe("Display name of the category"),
      slug: z.string().describe("URL-friendly slug (lowercase with hyphens)"),
      description: z
        .string()
        .nullable()
        .optional()
        .describe("Optional description"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      category: z
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
        const existing = await db.category.findFirst({
          where: { slug: context.slug, workspaceId },
        });

        if (existing) {
          return {
            success: false,
            error: `Category with slug '${context.slug}' already exists`,
          };
        }

        const category = await db.category.create({
          data: {
            name: context.name,
            slug: context.slug,
            description: context.description,
            workspaceId,
          },
        });

        return {
          success: true,
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
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
