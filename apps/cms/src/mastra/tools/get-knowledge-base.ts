import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool to retrieve the workspace's AI knowledge base.
 * Returns stored preferences, target audience, keywords, and content settings.
 */
export const createGetKnowledgeBaseTool = (workspaceId: string) =>
  createTool({
    id: "get-knowledge-base",
    description: `Retrieve the workspace's AI knowledge base containing website info, target audience, keywords, and content preferences.
Use this to personalize content creation and ensure blog posts match the user's brand voice and target audience.
Returns null fields if no knowledge base exists or if specific fields haven't been configured.`,
    inputSchema: z.object({}),
    outputSchema: z.object({
      exists: z.boolean(),
      websiteUrl: z.string().nullable().optional(),
      industry: z.string().nullable().optional(),
      niche: z.string().nullable().optional(),
      targetAudience: z
        .object({
          demographics: z.string().optional(),
          interests: z.array(z.string()).optional(),
          painPoints: z.array(z.string()).optional(),
          goals: z.array(z.string()).optional(),
        })
        .nullable()
        .optional(),
      writingTone: z.string().nullable().optional(),
      brandVoice: z.string().nullable().optional(),
      contentGuidelines: z.string().nullable().optional(),
      targetKeywords: z.array(z.string()).optional(),
      competitors: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().optional(),
            notes: z.string().optional(),
          })
        )
        .nullable()
        .optional(),
      customFields: z
        .array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        )
        .nullable()
        .optional(),
      onboardingCompleted: z.boolean().optional(),
    }),
    execute: async () => {
      const knowledgeBase = await db.aiKnowledgeBase.findUnique({
        where: { workspaceId },
      });

      if (!knowledgeBase) {
        return {
          exists: false,
          onboardingCompleted: false,
        };
      }

      return {
        exists: true,
        websiteUrl: knowledgeBase.websiteUrl,
        industry: knowledgeBase.industry,
        niche: knowledgeBase.niche,
        targetAudience: knowledgeBase.targetAudience as {
          demographics?: string;
          interests?: string[];
          painPoints?: string[];
          goals?: string[];
        } | null,
        writingTone: knowledgeBase.writingTone,
        brandVoice: knowledgeBase.brandVoice,
        contentGuidelines: knowledgeBase.contentGuidelines,
        targetKeywords: knowledgeBase.targetKeywords,
        competitors: knowledgeBase.competitors as Array<{
          name: string;
          url?: string;
          notes?: string;
        }> | null,
        customFields: knowledgeBase.customFields as Array<{
          key: string;
          value: string;
        }> | null,
        onboardingCompleted: knowledgeBase.onboardingCompleted,
      };
    },
  });
