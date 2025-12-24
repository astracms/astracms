import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool to update the workspace's AI knowledge base.
 * Allows the agent to save new information during conversation.
 */
export const createUpdateKnowledgeBaseTool = (workspaceId: string) =>
  createTool({
    id: "update-knowledge-base",
    description: `Update the workspace's AI knowledge base with new information.
Use this when the user provides information about their website, audience, or preferences during conversation.
This helps personalize future content creation.`,
    inputSchema: z.object({
      websiteUrl: z
        .string()
        .url()
        .optional()
        .describe("The user's website URL"),
      industry: z
        .string()
        .optional()
        .describe("The industry/sector (e.g., Technology, Healthcare)"),
      niche: z
        .string()
        .optional()
        .describe("The specific niche within the industry"),
      targetAudience: z
        .object({
          demographics: z
            .string()
            .optional()
            .describe("Target audience demographics"),
          interests: z
            .array(z.string())
            .optional()
            .describe("Audience interests"),
          painPoints: z
            .array(z.string())
            .optional()
            .describe("Problems the audience faces"),
          goals: z
            .array(z.string())
            .optional()
            .describe("Goals the audience wants to achieve"),
        })
        .optional()
        .describe("Target audience information"),
      writingTone: z
        .enum([
          "professional",
          "casual",
          "friendly",
          "authoritative",
          "educational",
        ])
        .optional()
        .describe("Preferred writing tone"),
      brandVoice: z
        .string()
        .optional()
        .describe("Description of the brand's voice and personality"),
      contentGuidelines: z
        .string()
        .optional()
        .describe("Specific content guidelines to follow"),
      targetKeywords: z
        .array(z.string())
        .optional()
        .describe("Target SEO keywords"),
      competitors: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().optional(),
            notes: z.string().optional(),
          })
        )
        .optional()
        .describe("Competitor information"),
      customFields: z
        .array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        )
        .optional()
        .describe("Custom key-value data for specific needs"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedFields: z.array(z.string()),
    }),
    execute: async ({ context }) => {
      const updateData: Record<string, unknown> = {};
      const updatedFields: string[] = [];

      if (context.websiteUrl !== undefined) {
        updateData.websiteUrl = context.websiteUrl;
        updatedFields.push("websiteUrl");
      }
      if (context.industry !== undefined) {
        updateData.industry = context.industry;
        updatedFields.push("industry");
      }
      if (context.niche !== undefined) {
        updateData.niche = context.niche;
        updatedFields.push("niche");
      }
      if (context.targetAudience !== undefined) {
        updateData.targetAudience = context.targetAudience;
        updatedFields.push("targetAudience");
      }
      if (context.writingTone !== undefined) {
        updateData.writingTone = context.writingTone;
        updatedFields.push("writingTone");
      }
      if (context.brandVoice !== undefined) {
        updateData.brandVoice = context.brandVoice;
        updatedFields.push("brandVoice");
      }
      if (context.contentGuidelines !== undefined) {
        updateData.contentGuidelines = context.contentGuidelines;
        updatedFields.push("contentGuidelines");
      }
      if (context.targetKeywords !== undefined) {
        updateData.targetKeywords = context.targetKeywords;
        updatedFields.push("targetKeywords");
      }
      if (context.competitors !== undefined) {
        updateData.competitors = context.competitors;
        updatedFields.push("competitors");
      }
      if (context.customFields !== undefined) {
        updateData.customFields = context.customFields;
        updatedFields.push("customFields");
      }

      if (updatedFields.length === 0) {
        return {
          success: false,
          message: "No fields provided to update",
          updatedFields: [],
        };
      }

      await db.aiKnowledgeBase.upsert({
        where: { workspaceId },
        update: updateData,
        create: {
          workspaceId,
          ...updateData,
          targetKeywords:
            (updateData.targetKeywords as string[] | undefined) ?? [],
        },
      });

      return {
        success: true,
        message: `Successfully updated ${updatedFields.length} field(s) in the knowledge base`,
        updatedFields,
      };
    },
  });
