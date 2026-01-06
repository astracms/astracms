/**
 * Generate Blog Topic Action
 *
 * Uses AI to generate compelling blog topic ideas based on configuration.
 */

import { createCMSAgent } from "@/mastra";
import type { ActionResult, WorkflowContext } from "../index";

export interface GenerateBlogTopicConfig {
  niche?: string;
  keywords?: string[];
  count?: number;
}

export async function generateBlogTopic(
  context: WorkflowContext,
  config: GenerateBlogTopicConfig
): Promise<ActionResult> {
  try {
    const { workspaceId, customPrompt } = context;
    const { niche, keywords = [], count = 5 } = config;

    // Create a minimal agent for topic generation
    const agent = createCMSAgent({
      workspaceId,
      userId: "workflow-system",
      userName: "Workflow Engine",
    });

    // Build prompt incorporating custom prompt if provided
    let prompt = `Generate ${count} compelling blog post topic ideas`;

    if (niche) {
      prompt += ` in the ${niche} niche`;
    }

    if (keywords.length > 0) {
      prompt += `. Focus on these keywords: ${keywords.join(", ")}`;
    }

    if (customPrompt) {
      prompt += `\n\nAdditional context from user: ${customPrompt}`;
    }

    prompt += `\n\nFor each topic, provide:
1. A catchy title (40-60 characters)
2. A brief one-sentence description

Format each topic as:
Title: [title]
Description: [description]

Separate topics with a blank line. Return only the topics, no additional text.`;

    const response = await agent.generate([{ role: "user", content: prompt }]);

    // Parse topics from response
    const text = response.text ?? "";
    const topics = parseTopics(text, count);

    // Store topics in context for next nodes
    context.data.topics = topics;
    context.data.selectedTopic = topics[0]; // Default to first topic

    return {
      success: true,
      output: {
        topics,
        selectedTopic: topics[0],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Parse topics from AI response
 */
function parseTopics(
  text: string,
  maxCount: number
): Array<{ title: string; description: string }> {
  const topics: Array<{ title: string; description: string }> = [];
  const blocks = text.split(/\n\n+/);

  for (const block of blocks) {
    if (topics.length >= maxCount) break;

    const titleMatch = block.match(/Title:\s*(.+?)(?:\n|$)/i);
    const descMatch = block.match(/Description:\s*(.+?)(?:\n|$)/i);

    if (titleMatch?.[1]) {
      topics.push({
        title: titleMatch[1].trim(),
        description: descMatch?.[1]?.trim() ?? "",
      });
    }
  }

  // Fallback: if parsing failed, use lines as topics
  if (topics.length === 0) {
    const lines = text.split("\n").filter((l) => l.trim().length > 10);
    for (const line of lines.slice(0, maxCount)) {
      topics.push({
        title: line.replace(/^\d+\.\s*/, "").trim(),
        description: "",
      });
    }
  }

  return topics;
}
