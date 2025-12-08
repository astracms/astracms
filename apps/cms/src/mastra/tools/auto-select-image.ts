import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Auto-select the most suitable cover image from the media library
 * Searches for images matching keywords from the post title/content
 */
export const createAutoSelectImageTool = (workspaceId: string) =>
  createTool({
    id: "auto-select-image",
    description:
      "Automatically select the most suitable cover image from the media library based on keywords. Returns the best matching image URL or null if no suitable image found.",
    inputSchema: z.object({
      keywords: z
        .array(z.string())
        .describe(
          "Keywords to search for (extracted from title, topic, or content)"
        ),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      imageUrl: z.string().nullable(),
      imageName: z.string().nullable(),
      matchedKeyword: z.string().nullable(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const { keywords } = context;

        // Try to find an image matching any keyword
        for (const keyword of keywords) {
          const image = await db.media.findFirst({
            where: {
              workspaceId,
              type: "image",
              name: { contains: keyword, mode: "insensitive" },
            },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              url: true,
              name: true,
            },
          });

          if (image) {
            return {
              success: true,
              imageUrl: image.url,
              imageName: image.name,
              matchedKeyword: keyword,
            };
          }
        }

        // No matching image found - return the most recent image as fallback
        const recentImage = await db.media.findFirst({
          where: {
            workspaceId,
            type: "image",
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            url: true,
            name: true,
          },
        });

        if (recentImage) {
          return {
            success: true,
            imageUrl: recentImage.url,
            imageName: recentImage.name,
            matchedKeyword: null,
          };
        }

        // No images at all in the library
        return {
          success: true,
          imageUrl: null,
          imageName: null,
          matchedKeyword: null,
        };
      } catch (error: unknown) {
        return {
          success: false,
          imageUrl: null,
          imageName: null,
          matchedKeyword: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
