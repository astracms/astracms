/**
 * Content Strategy Tool
 *
 * Generates strategic content ideas and identifies opportunities based on
 * existing content, target keywords, and industry trends.
 */
import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateWithAI } from "../lib/ai-generator";

/**
 * Create the content strategy tool
 */
export const createContentStrategyTool = (workspaceId: string) =>
  createTool({
    id: "content-strategy",
    description:
      "Generate strategic content ideas based on existing content, target keywords, and industry trends. Analyzes your content library to identify gaps and opportunities. Provides prioritized topic suggestions with estimated value, content type recommendations, and trending topics in your niche.",
    inputSchema: z.object({
      targetAudience: z
        .string()
        .optional()
        .describe(
          "Target audience or customer persona (e.g., 'small business owners', 'SaaS founders')"
        ),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Target keywords or topics to explore"),
      contentType: z
        .enum([
          "blog",
          "guide",
          "tutorial",
          "listicle",
          "comparison",
          "case-study",
          "any",
        ])
        .optional()
        .default("any")
        .describe("Preferred content type"),
      competitors: z
        .array(z.string())
        .optional()
        .describe("Competitor domains or brands to analyze (optional)"),
    }),
    outputSchema: z.object({
      topicIdeas: z
        .array(
          z.object({
            topic: z.string(),
            angle: z.string(),
            targetKeywords: z.array(z.string()),
            contentType: z.string(),
            estimatedValue: z.enum(["high", "medium", "low"]),
            reasoning: z.string(),
          })
        )
        .describe("8-12 prioritized content ideas"),
      contentGaps: z
        .array(
          z.object({
            gap: z.string(),
            opportunity: z.string(),
            suggestedTopics: z.array(z.string()),
          })
        )
        .describe("Identified gaps in current content"),
      trendingTopics: z
        .array(z.string())
        .describe("Current trending topics in the niche"),
      recommendations: z
        .string()
        .describe("Strategic recommendations and next steps"),
    }),
    execute: async ({ context }) => {
      try {
        const {
          targetAudience = "general audience",
          keywords = [],
          contentType = "any",
          competitors = [],
        } = context;

        console.log(
          "[CONTENT STRATEGY] Starting analysis for workspace:",
          workspaceId
        );
        console.log("[CONTENT STRATEGY] Target audience:", targetAudience);
        console.log("[CONTENT STRATEGY] Keywords:", keywords.join(", "));

        // ===== ANALYZE EXISTING CONTENT =====
        console.log("[CONTENT STRATEGY] Analyzing existing content...");

        // Get published posts
        const posts = await db.post.findMany({
          where: { workspaceId, status: "published" },
          select: {
            title: true,
            description: true,
            category: {
              select: { name: true },
            },
            tags: {
              select: { name: true },
            },
          },
          orderBy: { publishedAt: "desc" },
          take: 20,
        });

        // Get categories and tags
        const categories = await db.category.findMany({
          where: { workspaceId },
          select: { name: true, _count: { select: { posts: true } } },
        });

        const tags = await db.tag.findMany({
          where: { workspaceId },
          select: { name: true, _count: { select: { posts: true } } },
        });

        // Analyze content distribution
        const existingTopics = posts.map((p) => p.title).join("\n- ");
        const existingCategories = categories
          .map((c) => `${c.name} (${c._count.posts} posts)`)
          .join(", ");
        const existingTags = tags
          .map((t) => `${t.name} (${t._count.posts} posts)`)
          .join(", ");

        console.log(
          "[CONTENT STRATEGY] Found",
          posts.length,
          "published posts"
        );
        console.log("[CONTENT STRATEGY] Categories:", categories.length);
        console.log("[CONTENT STRATEGY] Tags:", tags.length);

        // ===== GENERATE STRATEGY RECOMMENDATIONS =====
        const keywordContext =
          keywords.length > 0
            ? `\nTarget keywords: ${keywords.join(", ")}`
            : "";
        const competitorContext =
          competitors.length > 0
            ? `\nCompetitors to consider: ${competitors.join(", ")}`
            : "";

        const existingContentContext =
          posts.length > 0
            ? `\nExisting content:\n- ${existingTopics}\n\nCategories: ${existingCategories}\nTags: ${existingTags}`
            : "\nNo existing published content yet - this is a fresh start.";

        const text = await generateWithAI(
          `Generate a comprehensive content strategy based on this workspace's needs.

TARGET AUDIENCE: ${targetAudience}
PREFERRED CONTENT TYPE: ${contentType}${keywordContext}${competitorContext}
${existingContentContext}

Provide strategic recommendations in the following structure:

## TOPIC IDEAS (8-12 ideas)
For each topic, provide:
- Topic: [clear, specific topic]
- Angle: [unique perspective or approach]
- Target Keywords: [keyword1, keyword2, keyword3]
- Content Type: [blog/guide/tutorial/listicle/comparison/case-study]
- Estimated Value: [high/medium/low]
- Reasoning: [why this topic is valuable - search volume, competition, audience need]

Format each idea as:
Topic: [topic] | Angle: [angle] | Keywords: [kw1, kw2, kw3] | Type: [type] | Value: [high/medium/low] | Reason: [reasoning]

## CONTENT GAPS (3-5 gaps)
Identify areas not covered by existing content that represent opportunities.

Format each gap as:
Gap: [what's missing] | Opportunity: [why it matters] | Suggested Topics: [topic1, topic2, topic3]

## TRENDING TOPICS (5-8 topics)
List current trending topics in this niche that would be timely and valuable.

Format: bullet list of trending topics

## STRATEGIC RECOMMENDATIONS
Provide a strategic summary (3-5 sentences) covering:
- Content calendar priorities (what to focus on first)
- Topic clustering strategy (how topics should relate)
- Long-term content goals (3-6 month vision)

Generate comprehensive content strategy now:`
        );

        // Extract topic ideas
        const topicIdeas: Array<{
          topic: string;
          angle: string;
          targetKeywords: string[];
          contentType: string;
          estimatedValue: "high" | "medium" | "low";
          reasoning: string;
        }> = [];

        const topicsSection =
          text.match(/## TOPIC IDEAS[\s\S]*?(?=## |$)/i)?.[0] || "";
        const topicMatches = topicsSection.matchAll(
          /Topic:\s*([^|]+)\s*\|\s*Angle:\s*([^|]+)\s*\|\s*Keywords:\s*([^|]+)\s*\|\s*Type:\s*([^|]+)\s*\|\s*Value:\s*(high|medium|low)\s*\|\s*Reason:\s*([^\n]+)/gi
        );

        for (const match of topicMatches) {
          if (
            match[1] &&
            match[2] &&
            match[3] &&
            match[4] &&
            match[5] &&
            match[6]
          ) {
            topicIdeas.push({
              topic: match[1].trim(),
              angle: match[2].trim(),
              targetKeywords: match[3]
                .split(",")
                .map((k) => k.trim())
                .filter((k) => k.length > 0),
              contentType: match[4].trim(),
              estimatedValue: match[5].toLowerCase() as
                | "high"
                | "medium"
                | "low",
              reasoning: match[6].trim(),
            });
          }
        }

        // Fallback topic ideas
        if (topicIdeas.length === 0) {
          const baseKeyword = keywords[0] || "content marketing";
          topicIdeas.push(
            {
              topic: `Complete Guide to ${baseKeyword} for ${targetAudience}`,
              angle: "Comprehensive beginner-friendly resource",
              targetKeywords: [
                baseKeyword,
                `${baseKeyword} guide`,
                `${baseKeyword} tutorial`,
              ],
              contentType: "guide",
              estimatedValue: "high",
              reasoning:
                "Comprehensive guides attract high-quality traffic and establish authority",
            },
            {
              topic: `${baseKeyword}: Common Mistakes and How to Avoid Them`,
              angle: "Problem-solution approach focusing on pain points",
              targetKeywords: [
                baseKeyword,
                `${baseKeyword} mistakes`,
                `${baseKeyword} tips`,
              ],
              contentType: "listicle",
              estimatedValue: "high",
              reasoning:
                "Mistake-focused content addresses specific user concerns and ranks well",
            },
            {
              topic: `Top 10 ${baseKeyword} Tools and Resources`,
              angle: "Curated tool comparison and recommendations",
              targetKeywords: [
                `${baseKeyword} tools`,
                `best ${baseKeyword}`,
                `${baseKeyword} software`,
              ],
              contentType: "comparison",
              estimatedValue: "medium",
              reasoning:
                "Tool roundups generate affiliate opportunities and sustained traffic",
            }
          );
        }

        // Extract content gaps
        const contentGaps: Array<{
          gap: string;
          opportunity: string;
          suggestedTopics: string[];
        }> = [];

        const gapsSection =
          text.match(/## CONTENT GAPS[\s\S]*?(?=## |$)/i)?.[0] || "";
        const gapMatches = gapsSection.matchAll(
          /Gap:\s*([^|]+)\s*\|\s*Opportunity:\s*([^|]+)\s*\|\s*Suggested Topics:\s*([^\n]+)/gi
        );

        for (const match of gapMatches) {
          if (match[1] && match[2] && match[3]) {
            contentGaps.push({
              gap: match[1].trim(),
              opportunity: match[2].trim(),
              suggestedTopics: match[3]
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0),
            });
          }
        }

        // Fallback content gaps
        if (contentGaps.length === 0) {
          if (posts.length === 0) {
            contentGaps.push({
              gap: "No published content yet",
              opportunity: "Establish authority with foundational content",
              suggestedTopics: [
                "Ultimate guide to core topic",
                "Getting started tutorial",
                "FAQ and common questions",
              ],
            });
          } else {
            contentGaps.push(
              {
                gap: "Advanced content for experienced users",
                opportunity:
                  "Serve the entire customer journey from beginner to expert",
                suggestedTopics: [
                  "Advanced techniques",
                  "Expert tips and tricks",
                  "In-depth case studies",
                ],
              },
              {
                gap: "Comparison and decision-making content",
                opportunity: "Capture high-intent commercial keywords",
                suggestedTopics: [
                  "Tool comparisons",
                  "Best practices",
                  "Buying guides",
                ],
              }
            );
          }
        }

        // Extract trending topics
        const trendingSection =
          text.match(/## TRENDING TOPICS[\s\S]*?(?=## |$)/i)?.[0] || "";
        const trendingTopics = trendingSection
          .replace(/## TRENDING TOPICS/i, "")
          .split(/[-•\n]/)
          .map((t) => t.trim())
          .filter((t) => t.length > 5)
          .slice(0, 8);

        // Fallback trending topics
        if (trendingTopics.length === 0) {
          trendingTopics.push(
            "AI and automation in content creation",
            "Sustainable and ethical business practices",
            "Remote work and productivity tools",
            "Data privacy and security concerns",
            "Personalization and customer experience"
          );
        }

        // Extract strategic recommendations
        const recommendationsSection =
          text.match(/## STRATEGIC RECOMMENDATIONS[\s\S]*$/i)?.[0] || "";
        const recommendations =
          recommendationsSection
            .replace(/## STRATEGIC RECOMMENDATIONS/i, "")
            .trim() ||
          "Focus on creating foundational content first (guides and tutorials) to establish authority. Build topic clusters around your core keywords to improve topical relevance. Maintain a consistent publishing schedule (2-3 posts per week) and update older content quarterly.";

        console.log("[CONTENT STRATEGY] ✅ Strategy generated");
        console.log("[CONTENT STRATEGY] Topic ideas:", topicIdeas.length);
        console.log("[CONTENT STRATEGY] Content gaps:", contentGaps.length);
        console.log(
          "[CONTENT STRATEGY] Trending topics:",
          trendingTopics.length
        );

        return {
          topicIdeas: topicIdeas.slice(0, 12),
          contentGaps: contentGaps.slice(0, 5),
          trendingTopics: trendingTopics.slice(0, 8),
          recommendations,
        };
      } catch (error) {
        console.error("[CONTENT STRATEGY] ❌ Error:", error);
        throw new Error(
          `Content strategy generation failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  });
