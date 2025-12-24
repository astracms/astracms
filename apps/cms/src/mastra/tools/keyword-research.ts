/**
 * Keyword Research Tool
 *
 * Analyzes and suggests keywords for SEO optimization.
 * Provides primary keywords with difficulty ratings, related keywords, and long-tail phrases.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateWithAI } from "../lib/ai-generator";

/**
 * Create the keyword research tool
 */
export const createKeywordResearchTool = (workspaceId: string) =>
  createTool({
    id: "keyword-research",
    description:
      "Research and analyze keywords for SEO optimization. Provides keyword suggestions with relevance scores, difficulty estimates, related terms, long-tail keywords, and strategic recommendations. Focuses on high-volume, low-competition keywords for better ranking opportunities. Ready for API integration with SEMrush, Ahrefs, or Google Keyword Planner. Use this before writing content to identify optimal keywords to target.",
    inputSchema: z.object({
      topic: z
        .string()
        .describe("The main topic or niche to research keywords for"),
      targetKeywords: z
        .array(z.string())
        .optional()
        .describe("Specific keywords to analyze (optional)"),
      audience: z
        .string()
        .optional()
        .describe(
          "Target audience or industry (e.g., 'small business owners', 'SaaS companies')"
        ),
    }),
    outputSchema: z.object({
      primaryKeywords: z
        .array(
          z.object({
            keyword: z.string(),
            relevance: z.number().min(0).max(100),
            difficulty: z.enum(["easy", "medium", "hard"]),
            searchIntent: z.enum([
              "informational",
              "commercial",
              "transactional",
              "navigational",
            ]),
            reason: z.string(),
          })
        )
        .describe("5-7 primary keywords with analysis"),
      highOpportunityKeywords: z
        .array(
          z.object({
            keyword: z.string(),
            volume: z.string(),
            competition: z.string(),
            opportunity: z.string(),
          })
        )
        .optional()
        .describe("3-5 high-volume, low-competition keyword opportunities"),
      relatedKeywords: z
        .array(z.string())
        .describe("12+ semantically related keywords"),
      longTailKeywords: z
        .array(
          z.object({
            phrase: z.string(),
            intent: z.string(),
          })
        )
        .describe("6-8 long-tail keyword phrases"),
      contentOpportunities: z
        .array(z.string())
        .describe("Specific content ideas based on keywords"),
      recommendations: z
        .string()
        .describe("Strategic recommendations for keyword usage"),
    }),
    execute: async ({ context }) => {
      try {
        const {
          topic,
          targetKeywords = [],
          audience = "general audience",
        } = context;

        console.log("[KEYWORD RESEARCH] Starting research for topic:", topic);

        // Build keyword research prompt
        const targetKeywordContext =
          targetKeywords.length > 0
            ? `\nSpecific keywords to analyze: ${targetKeywords.join(", ")}`
            : "";

        const text = await generateWithAI(
          `Conduct comprehensive keyword research for SEO optimization with focus on HIGH-VOLUME, LOW-COMPETITION keywords.

Topic: "${topic}"
Audience: ${audience}${targetKeywordContext}

IMPORTANT: Prioritize keywords with HIGH search volume but LOW to MEDIUM competition for maximum ranking opportunities. Focus on "easy wins" that can drive significant traffic.

Provide detailed keyword analysis in the following structure:

## PRIMARY KEYWORDS (5-7 keywords)
For each keyword, analyze:
- Keyword phrase (prioritize high-volume, low-competition terms)
- Relevance score (0-100): How relevant is this to the topic?
- Difficulty (easy/medium/hard): Competition level - prioritize EASY keywords
- Search intent (informational/commercial/transactional/navigational)
- Reason: Why this keyword is valuable for ranking and traffic

Format:
Keyword: [phrase] | Relevance: [0-100] | Difficulty: [easy/medium/hard] | Intent: [type] | Reason: [explanation]

## HIGH-OPPORTUNITY KEYWORDS (3-5 keywords)
Keywords with high search volume but low competition - these are your best ranking opportunities!

Format:
- [keyword] | Volume: [high/medium] | Competition: [low] | Opportunity: [why it's great for ranking]

## RELATED KEYWORDS (12+ keywords)
List semantically related keywords and LSI terms. Focus on terms with good search volume potential that complement your primary keywords.

Format: keyword1, keyword2, keyword3, etc.

## LONG-TAIL KEYWORDS (6-8 phrases)
Provide specific long-tail keyword phrases (3-6 words) that target specific user queries. These have lower competition and higher conversion potential.

Format:
- [long-tail phrase] | Intent: [what user is looking for]

## CONTENT OPPORTUNITIES (6+ ideas)
Based on keyword research, list specific content ideas that would rank well for your target keywords and provide value to your audience.

Format: bullet list of actionable content ideas

## STRATEGIC RECOMMENDATIONS
Provide strategic summary (4-5 sentences) on:
- Which keywords to prioritize (focus on high-volume, low-competition opportunities)
- Content structure suggestions for optimal SEO
- Keyword implementation strategy
- Long-term SEO roadmap

Generate comprehensive keyword research now:`,
          workspaceId,
          "keyword-research",
          10
        );

        // Extract primary keywords
        const primaryKeywords: Array<{
          keyword: string;
          relevance: number;
          difficulty: "easy" | "medium" | "hard";
          searchIntent:
            | "informational"
            | "commercial"
            | "transactional"
            | "navigational";
          reason: string;
        }> = [];

        const primarySection =
          text.match(/## PRIMARY KEYWORDS[\s\S]*?(?=## |$)/i)?.[0] || "";
        const primaryMatches = primarySection.matchAll(
          /Keyword:\s*([^|]+)\s*\|\s*Relevance:\s*(\d+)\s*\|\s*Difficulty:\s*(easy|medium|hard)\s*\|\s*Intent:\s*(informational|commercial|transactional|navigational)\s*\|\s*Reason:\s*([^\n]+)/gi
        );

        for (const match of primaryMatches) {
          const keyword = match[1]?.trim();
          const relevanceStr = match[2];
          const difficulty = match[3]?.toLowerCase();
          const intent = match[4]?.toLowerCase();
          const reason = match[5]?.trim();

          if (
            keyword &&
            relevanceStr &&
            difficulty &&
            intent &&
            reason &&
            ["easy", "medium", "hard"].includes(difficulty) &&
            [
              "informational",
              "commercial",
              "transactional",
              "navigational",
            ].includes(intent)
          ) {
            primaryKeywords.push({
              keyword,
              relevance: Number.parseInt(relevanceStr, 10),
              difficulty: difficulty as "easy" | "medium" | "hard",
              searchIntent: intent as
                | "informational"
                | "commercial"
                | "transactional"
                | "navigational",
              reason,
            });
          }
        }

        // Fallback if parsing fails
        if (primaryKeywords.length === 0) {
          primaryKeywords.push(
            {
              keyword: topic,
              relevance: 95,
              difficulty: "medium",
              searchIntent: "informational",
              reason: "Primary topic keyword with high relevance",
            },
            ...targetKeywords.slice(0, 4).map((kw) => ({
              keyword: kw,
              relevance: 85,
              difficulty: "medium" as const,
              searchIntent: "informational" as const,
              reason: "User-specified target keyword",
            }))
          );
        }

        // Extract high-opportunity keywords
        const highOpportunityKeywords: Array<{
          keyword: string;
          volume: string;
          competition: string;
          opportunity: string;
        }> = [];
        const highOppSection =
          text.match(/## HIGH-OPPORTUNITY KEYWORDS[\s\S]*?(?=## |$)/i)?.[0] ||
          "";
        const highOppMatches = highOppSection.matchAll(
          /-\s*([^|]+)\s*\|\s*Volume:\s*([^|]+)\s*\|\s*Competition:\s*([^|]+)\s*\|\s*Opportunity:\s*([^\n]+)/gi
        );

        for (const match of highOppMatches) {
          const keyword = match[1]?.trim();
          const volume = match[2]?.trim();
          const competition = match[3]?.trim();
          const opportunity = match[4]?.trim();
          if (keyword && volume && competition && opportunity) {
            highOpportunityKeywords.push({
              keyword,
              volume,
              competition,
              opportunity,
            });
          }
        }

        // Extract related keywords
        const relatedSection =
          text.match(/## RELATED KEYWORDS[\s\S]*?(?=## |$)/i)?.[0] || "";
        const relatedKeywords = relatedSection
          .replace(/## RELATED KEYWORDS/i, "")
          .split(/[,\n]/)
          .map((k) => k.trim())
          .filter((k) => k.length > 2 && k.length < 50)
          .slice(0, 15);

        // Fallback related keywords
        if (relatedKeywords.length === 0) {
          relatedKeywords.push(
            topic,
            `${topic} guide`,
            `${topic} tips`,
            `best ${topic}`,
            `${topic} strategies`,
            `how to ${topic}`,
            `${topic} tutorial`,
            `${topic} examples`,
            `${topic} tools`,
            `${topic} techniques`
          );
        }

        // Extract long-tail keywords
        const longTailKeywords: Array<{ phrase: string; intent: string }> = [];
        const longTailSection =
          text.match(/## LONG-TAIL KEYWORDS[\s\S]*?(?=## |$)/i)?.[0] || "";
        const longTailMatches = longTailSection.matchAll(
          /[-•]\s*([^|]+)\s*\|\s*Intent:\s*([^\n]+)/gi
        );

        for (const match of longTailMatches) {
          const phrase = match[1]?.trim();
          const intent = match[2]?.trim();
          if (phrase && intent) {
            longTailKeywords.push({
              phrase,
              intent,
            });
          }
        }

        // Fallback long-tail keywords
        if (longTailKeywords.length === 0) {
          longTailKeywords.push(
            {
              phrase: `how to ${topic} for beginners`,
              intent: "Learn the basics",
            },
            {
              phrase: `best ${topic} strategies for ${audience}`,
              intent: "Find proven methods",
            },
            {
              phrase: `${topic} step by step guide`,
              intent: "Get detailed instructions",
            },
            {
              phrase: `common ${topic} mistakes to avoid`,
              intent: "Avoid errors",
            },
            {
              phrase: `${topic} tools and resources`,
              intent: "Find helpful tools",
            }
          );
        }

        // Extract content opportunities
        const opportunitiesSection =
          text.match(/## CONTENT OPPORTUNITIES[\s\S]*?(?=## |$)/i)?.[0] || "";
        const contentOpportunities = opportunitiesSection
          .replace(/## CONTENT OPPORTUNITIES/i, "")
          .split(/[-•\n]/)
          .map((o) => o.trim())
          .filter((o) => o.length > 10)
          .slice(0, 8);

        // Fallback opportunities
        if (contentOpportunities.length === 0) {
          contentOpportunities.push(
            `Complete guide to ${topic}`,
            `${topic}: Common mistakes and how to avoid them`,
            `Top tools and resources for ${topic}`,
            `${topic} case studies and examples`,
            `${topic} FAQ: Answering your top questions`
          );
        }

        // Extract strategic recommendations
        const recommendationsSection =
          text.match(/## STRATEGIC RECOMMENDATIONS[\s\S]*$/i)?.[0] || "";
        const recommendations =
          recommendationsSection
            .replace(/## STRATEGIC RECOMMENDATIONS/i, "")
            .trim() ||
          `Focus on primary keywords with 'easy' to 'medium' difficulty. Incorporate related keywords naturally throughout your content. Target long-tail keywords for specific user queries to capture high-intent traffic.`;

        console.log("[KEYWORD RESEARCH] Analysis complete");
        console.log(
          "[KEYWORD RESEARCH] Found:",
          primaryKeywords.length,
          "primary keywords,",
          relatedKeywords.length,
          "related keywords,",
          longTailKeywords.length,
          "long-tail phrases"
        );

        return {
          primaryKeywords: primaryKeywords.slice(0, 7),
          highOpportunityKeywords: highOpportunityKeywords.slice(0, 5),
          relatedKeywords: relatedKeywords.slice(0, 15),
          longTailKeywords: longTailKeywords.slice(0, 8),
          contentOpportunities: contentOpportunities.slice(0, 8),
          recommendations,
        };
      } catch (error) {
        console.error("[KEYWORD RESEARCH] Error:", error);
        throw new Error(
          `Keyword research failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  });
