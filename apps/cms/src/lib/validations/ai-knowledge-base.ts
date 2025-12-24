import { z } from "zod";

// Target Audience Schema
export const targetAudienceSchema = z.object({
  demographics: z.string().optional(),
  interests: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
});
export type TargetAudience = z.infer<typeof targetAudienceSchema>;

// Competitor Schema
export const competitorSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  notes: z.string().optional(),
});
export type Competitor = z.infer<typeof competitorSchema>;

// Custom Field Schema
export const customFieldSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});
export type CustomField = z.infer<typeof customFieldSchema>;

// Keyword Theme Schema
export const keywordThemeSchema = z.record(z.string(), z.array(z.string()));
export type KeywordTheme = z.infer<typeof keywordThemeSchema>;

// Writing Tone Enum
export const writingToneEnum = z.enum([
  "professional",
  "casual",
  "friendly",
  "authoritative",
  "educational",
]);
export type WritingTone = z.infer<typeof writingToneEnum>;

// Knowledge Base Create/Update Schema
export const aiKnowledgeBaseSchema = z.object({
  websiteUrl: z.string().url().optional().nullable(),
  websiteAnalysis: z.any().optional().nullable(),
  industry: z.string().optional().nullable(),
  niche: z.string().optional().nullable(),
  targetAudience: targetAudienceSchema.optional().nullable(),
  writingTone: writingToneEnum.optional().nullable(),
  brandVoice: z.string().optional().nullable(),
  contentGuidelines: z.string().optional().nullable(),
  targetKeywords: z.array(z.string()).optional(),
  keywordThemes: keywordThemeSchema.optional().nullable(),
  competitors: z.array(competitorSchema).optional().nullable(),
  customFields: z.array(customFieldSchema).optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
  onboardingStep: z.number().int().min(0).optional(),
});
export type AiKnowledgeBaseValues = z.infer<typeof aiKnowledgeBaseSchema>;

// Website Analysis Request Schema
export const websiteAnalysisRequestSchema = z.object({
  url: z.string().url({ message: "Please provide a valid URL" }),
});
export type WebsiteAnalysisRequest = z.infer<
  typeof websiteAnalysisRequestSchema
>;

// Website Analysis Result Schema
export const websiteAnalysisResultSchema = z.object({
  industry: z.string().optional(),
  niche: z.string().optional(),
  targetAudience: targetAudienceSchema.optional(),
  brandVoice: z.string().optional(),
  contentThemes: z.array(z.string()).optional(),
  suggestedKeywords: z.array(z.string()).optional(),
});
export type WebsiteAnalysisResult = z.infer<typeof websiteAnalysisResultSchema>;

// Onboarding Step Update Schema
export const onboardingStepSchema = z.object({
  step: z.number().int().min(0).max(10),
});
export type OnboardingStepValues = z.infer<typeof onboardingStepSchema>;
