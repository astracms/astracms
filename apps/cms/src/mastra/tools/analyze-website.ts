import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { tavily } from "@tavily/core";
import { z } from "zod";
import { generateWithAI } from "../lib/ai-generator";

const WEBSITE_ANALYSIS_CREDIT_COST = 10;

/**
 * Tool to analyze a website URL and extract context for content personalization.
 * Uses Tavily for web search and AI for structured extraction.
 */
export const createAnalyzeWebsiteTool = (workspaceId: string) =>
  createTool({
    id: "analyze-website",
    description: `Perform comprehensive website analysis including industry classification, competitor research, content gap analysis, and trend identification.
Extracts: industry/niche, target audience, brand voice, content themes, SEO keywords, competitors, industry trends, and existing content keywords.
Use this during onboarding or when analyzing websites for content strategy.
The analysis results are automatically saved to the knowledge base for personalization.`,
    inputSchema: z.object({
      url: z.string().url().describe("The website URL to analyze"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      industry: z.string().optional(),
      niche: z.string().optional(),
      targetAudience: z
        .object({
          demographics: z.string().optional(),
          interests: z.array(z.string()).optional(),
          painPoints: z.array(z.string()).optional(),
          goals: z.array(z.string()).optional(),
        })
        .optional(),
      brandVoice: z.string().optional(),
      contentThemes: z.array(z.string()).optional(),
      suggestedKeywords: z.array(z.string()).optional(),
      competitors: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().optional(),
          })
        )
        .optional(),
      industryTrends: z.array(z.string()).optional(),
      existingContentKeywords: z.array(z.string()).optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      const { url } = context;

      // Check Tavily API key
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: "Website analysis is not configured (missing TAVILY_API_KEY)",
        };
      }

      try {
        // Use Tavily to search for comprehensive information about the website
        const client = tavily({ apiKey });

        // Extract domain for competitor search
        const domain = new URL(url).hostname.replace("www.", "");

        // Perform multiple searches for comprehensive analysis
        const [
          companySearch,
          siteSearch,
          blogSearch,
          competitorSearch,
          industryTrendsSearch,
        ] = await Promise.all([
          // Company information
          client.search(`site:${url} about company business`, {
            maxResults: 5,
            includeAnswer: true,
          }),
          // Direct site content
          client.search(url, {
            maxResults: 3,
            includeAnswer: true,
          }),
          // Blog/content search
          client.search(`site:${url} blog OR articles OR resources`, {
            maxResults: 5,
            includeAnswer: true,
          }),
          // Competitor analysis
          client.search(
            `${domain} competitors OR alternatives OR similar companies`,
            {
              maxResults: 5,
              includeAnswer: true,
            }
          ),
          // Industry trends
          client.search(
            `${domain} industry trends OR market analysis OR future outlook`,
            {
              maxResults: 3,
              includeAnswer: true,
            }
          ),
        ]);

        // Combine all content
        const combinedContent = [
          // Company info
          ...(companySearch.results?.map(
            (r: { content: string }) => r.content
          ) ?? []),
          companySearch.answer ?? "",

          // Site content
          ...(siteSearch.results?.map((r: { content: string }) => r.content) ??
            []),
          siteSearch.answer ?? "",

          // Blog content
          ...(blogSearch.results?.map((r: { content: string }) => r.content) ??
            []),
          blogSearch.answer ?? "",

          // Competitor info
          ...(competitorSearch.results?.map(
            (r: { content: string }) => r.content
          ) ?? []),
          competitorSearch.answer ?? "",

          // Industry trends
          ...(industryTrendsSearch.results?.map(
            (r: { content: string }) => r.content
          ) ?? []),
          industryTrendsSearch.answer ?? "",
        ]
          .filter(Boolean)
          .join("\n\n");

        if (!combinedContent.trim()) {
          return {
            success: false,
            error: "Could not find enough information about this website",
          };
        }

        // Use AI to analyze the content
        const analysisPrompt = `Analyze the following comprehensive website content and extract structured information for a blog content strategy.

Website URL: ${url}

Content found:
${combinedContent}

Please provide a JSON response with the following structure (use null for fields you cannot determine):
{
  "industry": "The primary industry/sector (e.g., Technology, Healthcare, Finance, E-commerce, Education)",
  "niche": "The specific niche within the industry (e.g., SaaS, Digital Marketing, Fitness Tech)",
  "targetAudience": {
    "demographics": "Description of the target audience demographics (age, location, job roles, etc.)",
    "interests": ["interest1", "interest2", "interest3"],
    "painPoints": ["pain point 1", "pain point 2"],
    "goals": ["goal 1", "goal 2"]
  },
  "brandVoice": "Description of the brand's communication style and tone",
  "contentThemes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "competitors": [
    {"name": "Competitor Company Name", "url": "https://competitor.com"},
    {"name": "Another Competitor", "url": "https://another.com"}
  ],
  "industryTrends": ["trend1", "trend2", "trend3", "trend4"],
  "existingContentKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Analysis Guidelines:
- **Industry & Niche**: Be specific and accurate based on company description and services
- **Target Audience**: Extract from customer descriptions, use cases, and target market information
- **Brand Voice**: Analyze writing style, tone, and communication approach from content
- **Content Themes**: Identify main topic categories covered in existing content and blog posts
- **Suggested Keywords**: Focus on high-value SEO terms relevant to the business and industry
- **Competitors**: List 3-5 main competitors with their websites if available
- **Industry Trends**: Current and emerging trends affecting this business sector
- **Existing Content Keywords**: Keywords already ranking well or frequently used in existing content

Respond ONLY with the JSON object, no additional text or formatting.`;

        const analysisResult = await generateWithAI(
          analysisPrompt,
          workspaceId,
          "website-analysis",
          WEBSITE_ANALYSIS_CREDIT_COST
        );

        // Parse the AI response
        let parsedResult: {
          industry?: string;
          niche?: string;
          targetAudience?: {
            demographics?: string;
            interests?: string[];
            painPoints?: string[];
            goals?: string[];
          };
          brandVoice?: string;
          contentThemes?: string[];
          suggestedKeywords?: string[];
          competitors?: Array<{ name: string; url?: string }>;
          industryTrends?: string[];
          existingContentKeywords?: string[];
        };
        try {
          const cleanedResult = analysisResult
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          parsedResult = JSON.parse(cleanedResult);
        } catch {
          return {
            success: false,
            error: "Failed to parse analysis results",
          };
        }

        // Store the analysis in the knowledge base
        await db.aiKnowledgeBase.upsert({
          where: { workspaceId },
          update: {
            websiteUrl: url,
            websiteAnalysis: parsedResult,
            industry: parsedResult.industry,
            niche: parsedResult.niche,
            targetAudience: parsedResult.targetAudience,
            brandVoice: parsedResult.brandVoice,
            targetKeywords: parsedResult.suggestedKeywords || [],
            competitors: parsedResult.competitors,
            keywordThemes: parsedResult.industryTrends
              ? { "industry-trends": parsedResult.industryTrends }
              : undefined,
            customFields: parsedResult.existingContentKeywords
              ? [
                  {
                    key: "existing-content-keywords",
                    value: parsedResult.existingContentKeywords.join(", "),
                  },
                ]
              : undefined,
          },
          create: {
            workspaceId,
            websiteUrl: url,
            websiteAnalysis: parsedResult,
            industry: parsedResult.industry,
            niche: parsedResult.niche,
            targetAudience: parsedResult.targetAudience,
            brandVoice: parsedResult.brandVoice,
            targetKeywords: parsedResult.suggestedKeywords || [],
            competitors: parsedResult.competitors,
            keywordThemes: parsedResult.industryTrends
              ? { "industry-trends": parsedResult.industryTrends }
              : undefined,
            customFields: parsedResult.existingContentKeywords
              ? [
                  {
                    key: "existing-content-keywords",
                    value: parsedResult.existingContentKeywords.join(", "),
                  },
                ]
              : undefined,
          },
        });

        return {
          success: true,
          industry: parsedResult.industry,
          niche: parsedResult.niche,
          targetAudience: parsedResult.targetAudience,
          brandVoice: parsedResult.brandVoice,
          contentThemes: parsedResult.contentThemes,
          suggestedKeywords: parsedResult.suggestedKeywords,
          competitors: parsedResult.competitors,
          industryTrends: parsedResult.industryTrends,
          existingContentKeywords: parsedResult.existingContentKeywords,
        };
      } catch (error) {
        console.error("[AnalyzeWebsite] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Analysis failed",
        };
      }
    },
  });
