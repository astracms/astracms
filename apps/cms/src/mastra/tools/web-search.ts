import { createTool } from "@mastra/core/tools";
import { tavily } from "@tavily/core";
import { z } from "zod";

/**
 * Create a web search tool using Tavily API
 * Requires TAVILY_API_KEY environment variable
 */
export const createWebSearchTool = () => {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    // Return a placeholder tool that reports the missing key
    return createTool({
      id: "web-search",
      description:
        "Search the internet for current information. (Disabled: TAVILY_API_KEY not configured)",
      inputSchema: z.object({
        query: z.string().describe("The search query to look up"),
      }),
      outputSchema: z.object({
        results: z.array(z.unknown()),
        error: z.string().optional(),
      }),
      execute: async () => ({
        results: [],
        error: "Web search is not configured. TAVILY_API_KEY is required.",
      }),
    });
  }

  const client = tavily({ apiKey });

  return createTool({
    id: "web-search",
    description:
      "Search the internet for current information. Use this for researching topics, finding recent news, or getting information that might not be in the CMS.",
    inputSchema: z.object({
      query: z.string().describe("The search query to look up on the internet"),
      maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return (default: 5)"),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          content: z.string(),
          score: z.number().optional(),
        })
      ),
      answer: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const { query, maxResults = 5 } = context;

        const response = await client.search(query, {
          maxResults,
          includeAnswer: true,
        });

        return {
          results: response.results.map(
            (result: {
              title: string;
              url: string;
              content: string;
              score?: number;
            }) => ({
              title: result.title,
              url: result.url,
              content: result.content,
              score: result.score,
            })
          ),
          answer: response.answer,
        };
      } catch (error: unknown) {
        return {
          results: [],
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
};
