/**
 * SEO Analyzer Tool
 *
 * Analyzes content for SEO quality and provides actionable optimization recommendations.
 * Checks title, content structure, keyword usage, readability, and meta descriptions.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Calculate basic readability score (Flesch Reading Ease approximation)
 */
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => {
    // Simple syllable counting approximation
    const matches = word.toLowerCase().match(/[aeiouy]+/g);
    return count + (matches ? matches.length : 1);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(content: string, keyword: string): number {
  const contentLower = content.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  const words = content.split(/\s+/).length;

  const keywordCount = (contentLower.match(new RegExp(keywordLower, "g")) || [])
    .length;
  return words > 0 ? (keywordCount / words) * 100 : 0;
}

/**
 * Create the SEO analyzer tool
 */
export const createSEOAnalyzerTool = () =>
  createTool({
    id: "analyze-seo",
    description:
      "Analyze content for SEO quality and provide actionable optimization recommendations. Evaluates title optimization, content structure, keyword usage, readability, meta descriptions, and heading hierarchy. Returns overall SEO score (0-100) and prioritized recommendations.",
    inputSchema: z.object({
      title: z.string().describe("Blog post title"),
      content: z
        .string()
        .describe("Blog post content (markdown or plain text)"),
      description: z
        .string()
        .optional()
        .describe("Meta description (if available)"),
      targetKeyword: z
        .string()
        .optional()
        .describe("Primary keyword to optimize for"),
    }),
    outputSchema: z.object({
      overallScore: z.number().min(0).max(100).describe("Overall SEO score"),
      scores: z.object({
        titleScore: z.number().min(0).max(100),
        contentScore: z.number().min(0).max(100),
        readabilityScore: z.number().min(0).max(100),
        keywordScore: z.number().min(0).max(100),
        structureScore: z.number().min(0).max(100),
      }),
      recommendations: z.array(
        z.object({
          category: z.enum([
            "title",
            "content",
            "keywords",
            "readability",
            "meta",
            "structure",
          ]),
          issue: z.string(),
          fix: z.string(),
          priority: z.enum(["high", "medium", "low"]),
          impact: z.string(),
        })
      ),
      summary: z.string().describe("Overall assessment and key takeaways"),
    }),
    execute: async ({ context, mastra }) => {
      try {
        const {
          title,
          content,
          description = "",
          targetKeyword = "",
        } = context;

        console.log("[SEO ANALYZER] Starting analysis...");
        console.log("[SEO ANALYZER] Title length:", title.length, "chars");
        console.log(
          "[SEO ANALYZER] Content length:",
          content.split(/\s+/).length,
          "words"
        );

        const recommendations: Array<{
          category:
            | "title"
            | "content"
            | "keywords"
            | "readability"
            | "meta"
            | "structure";
          issue: string;
          fix: string;
          priority: "high" | "medium" | "low";
          impact: string;
        }> = [];

        // ===== TITLE ANALYSIS =====
        let titleScore = 100;

        // Title length (optimal: 50-60 characters)
        if (title.length < 30) {
          titleScore -= 20;
          recommendations.push({
            category: "title",
            issue: `Title is too short (${title.length} characters)`,
            fix: "Expand title to 50-60 characters for better search visibility",
            priority: "high",
            impact:
              "Titles under 30 chars are often cut off in search results and may not convey enough information",
          });
        } else if (title.length > 70) {
          titleScore -= 15;
          recommendations.push({
            category: "title",
            issue: `Title is too long (${title.length} characters)`,
            fix: "Shorten title to 50-60 characters to prevent truncation in search results",
            priority: "high",
            impact:
              "Titles over 60 chars are truncated by Google, reducing click-through rates",
          });
        }

        // Keyword in title
        if (
          targetKeyword &&
          !title.toLowerCase().includes(targetKeyword.toLowerCase())
        ) {
          titleScore -= 25;
          recommendations.push({
            category: "title",
            issue: "Target keyword not found in title",
            fix: `Include "${targetKeyword}" naturally in the title`,
            priority: "high",
            impact:
              "Keywords in titles have strong SEO impact and improve relevance",
          });
        }

        // Title starts with keyword (ideal)
        if (
          targetKeyword &&
          title.toLowerCase().indexOf(targetKeyword.toLowerCase()) > 10
        ) {
          titleScore -= 10;
          recommendations.push({
            category: "title",
            issue: "Target keyword appears late in title",
            fix: "Front-load the keyword by placing it at or near the beginning of the title",
            priority: "medium",
            impact:
              "Keywords at the start of titles carry more weight in search rankings",
          });
        }

        // ===== CONTENT ANALYSIS =====
        let contentScore = 100;
        const wordCount = content
          .split(/\s+/)
          .filter((w) => w.length > 0).length;

        // Word count (optimal: 1200-2000)
        if (wordCount < 800) {
          contentScore -= 25;
          recommendations.push({
            category: "content",
            issue: `Content is too short (${wordCount} words)`,
            fix: "Expand content to at least 1200 words for comprehensive coverage",
            priority: "high",
            impact:
              "Longer content (1200+ words) tends to rank better and provides more value",
          });
        } else if (wordCount > 3000) {
          contentScore -= 10;
          recommendations.push({
            category: "content",
            issue: `Content is very long (${wordCount} words)`,
            fix: "Consider breaking into multiple posts or adding a table of contents",
            priority: "low",
            impact:
              "Very long content may reduce engagement unless well-structured",
          });
        }

        // Keyword density (optimal: 1-2%)
        if (targetKeyword) {
          const density = calculateKeywordDensity(content, targetKeyword);
          if (density < 0.5) {
            contentScore -= 15;
            recommendations.push({
              category: "keywords",
              issue: `Keyword density too low (${density.toFixed(2)}%)`,
              fix: `Increase usage of "${targetKeyword}" to 1-2% density naturally throughout content`,
              priority: "medium",
              impact:
                "Low keyword density may signal lack of topical relevance",
            });
          } else if (density > 3) {
            contentScore -= 20;
            recommendations.push({
              category: "keywords",
              issue: `Keyword density too high (${density.toFixed(2)}%)`,
              fix: "Reduce keyword repetition to avoid appearing spammy (aim for 1-2%)",
              priority: "high",
              impact: "Keyword stuffing can result in search engine penalties",
            });
          }
        }

        // ===== STRUCTURE ANALYSIS =====
        let structureScore = 100;

        // Check for headings
        const h2Count = (content.match(/^## /gm) || []).length;
        const h3Count = (content.match(/^### /gm) || []).length;

        if (h2Count < 3) {
          structureScore -= 20;
          recommendations.push({
            category: "structure",
            issue: `Too few H2 headings (${h2Count} found)`,
            fix: "Add 3-5 H2 headings to organize content into clear sections",
            priority: "high",
            impact: "Proper heading structure improves readability and SEO",
          });
        }

        // Check for lists
        const bulletLists = (content.match(/^[-•*]\s/gm) || []).length;
        const numberedLists = (content.match(/^\d+\.\s/gm) || []).length;

        if (bulletLists + numberedLists < 3) {
          structureScore -= 10;
          recommendations.push({
            category: "structure",
            issue: "Few or no lists found in content",
            fix: "Add bullet points or numbered lists to improve scannability",
            priority: "medium",
            impact:
              "Lists make content easier to scan and improve user engagement",
          });
        }

        // ===== READABILITY ANALYSIS =====
        const readabilityScore = calculateReadabilityScore(content);
        let readabilityAdjustment = 0;

        if (readabilityScore < 30) {
          readabilityAdjustment = -20;
          recommendations.push({
            category: "readability",
            issue: `Content is very difficult to read (score: ${readabilityScore.toFixed(0)})`,
            fix: "Simplify sentences, use shorter words, and break up long paragraphs",
            priority: "high",
            impact:
              "Difficult content has higher bounce rates and lower engagement",
          });
        } else if (readabilityScore < 50) {
          readabilityAdjustment = -10;
          recommendations.push({
            category: "readability",
            issue: `Content is somewhat difficult to read (score: ${readabilityScore.toFixed(0)})`,
            fix: "Aim for shorter sentences (15-20 words) and simpler vocabulary",
            priority: "medium",
            impact: "Moderate readability issues can reduce user engagement",
          });
        }

        // ===== KEYWORD SCORE =====
        let keywordScore = 100;

        if (targetKeyword) {
          // Keyword in first 100 words
          const first100Words = content.split(/\s+/).slice(0, 100).join(" ");
          if (
            !first100Words.toLowerCase().includes(targetKeyword.toLowerCase())
          ) {
            keywordScore -= 20;
            recommendations.push({
              category: "keywords",
              issue: "Target keyword not found in first 100 words",
              fix: "Include target keyword in the opening paragraph",
              priority: "high",
              impact:
                "Early keyword placement signals topical relevance to search engines",
            });
          }
        } else {
          keywordScore -= 15;
          recommendations.push({
            category: "keywords",
            issue: "No target keyword specified",
            fix: "Identify and optimize for a primary target keyword",
            priority: "medium",
            impact:
              "Without a target keyword, SEO optimization is less effective",
          });
        }

        // ===== META DESCRIPTION ANALYSIS =====
        if (description) {
          if (description.length < 120 || description.length > 160) {
            contentScore -= 10;
            recommendations.push({
              category: "meta",
              issue: `Meta description length is ${description.length} characters (optimal: 150-160)`,
              fix:
                description.length < 120
                  ? "Expand meta description to 150-160 characters"
                  : "Shorten meta description to 150-160 characters",
              priority: "medium",
              impact:
                "Poorly sized descriptions are truncated or ignored by search engines",
            });
          }

          if (
            targetKeyword &&
            !description.toLowerCase().includes(targetKeyword.toLowerCase())
          ) {
            contentScore -= 10;
            recommendations.push({
              category: "meta",
              issue: "Target keyword not in meta description",
              fix: `Include "${targetKeyword}" in the meta description`,
              priority: "medium",
              impact:
                "Keywords in descriptions are bolded in search results, improving CTR",
            });
          }
        } else {
          contentScore -= 15;
          recommendations.push({
            category: "meta",
            issue: "No meta description provided",
            fix: "Create a compelling 150-160 character meta description",
            priority: "high",
            impact:
              "Meta descriptions significantly impact click-through rates",
          });
        }

        // ===== CALCULATE OVERALL SCORE =====
        const scores = {
          titleScore: Math.max(0, titleScore),
          contentScore: Math.max(0, contentScore),
          readabilityScore: Math.max(
            0,
            readabilityScore + readabilityAdjustment
          ),
          keywordScore: Math.max(0, keywordScore),
          structureScore: Math.max(0, structureScore),
        };

        const overallScore = Math.round(
          scores.titleScore * 0.2 +
            scores.contentScore * 0.25 +
            scores.readabilityScore * 0.15 +
            scores.keywordScore * 0.25 +
            scores.structureScore * 0.15
        );

        // Generate summary
        let summary = "";
        if (overallScore >= 80) {
          summary = `Excellent SEO optimization (${overallScore}/100). Your content is well-optimized with strong fundamentals. Focus on the ${recommendations.filter((r) => r.priority === "high").length} high-priority items to reach 90+.`;
        } else if (overallScore >= 60) {
          summary = `Good SEO foundation (${overallScore}/100). Address the ${recommendations.filter((r) => r.priority === "high").length} high-priority recommendations to significantly improve rankings.`;
        } else if (overallScore >= 40) {
          summary = `Moderate SEO optimization (${overallScore}/100). Several important improvements needed. Start with high-priority fixes for title, keywords, and content structure.`;
        } else {
          summary = `Significant SEO improvements needed (${overallScore}/100). Content requires optimization in multiple areas. Prioritize title optimization, keyword usage, and content length.`;
        }

        // Sort recommendations by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        recommendations.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );

        console.log("[SEO ANALYZER] Analysis complete");
        console.log("[SEO ANALYZER] Overall score:", overallScore, "/100");
        console.log("[SEO ANALYZER] Recommendations:", recommendations.length);

        return {
          overallScore,
          scores,
          recommendations,
          summary,
        };
      } catch (error) {
        console.error("[SEO ANALYZER] Error:", error);
        throw new Error(
          `SEO analysis failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  });
