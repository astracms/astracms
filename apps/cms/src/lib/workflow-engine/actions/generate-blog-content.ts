/**
 * Generate Blog Content Action
 *
 * Uses AI to generate full blog post content based on topic and configuration.
 */

import { createCMSAgent } from "@/mastra";
import type { ActionResult, WorkflowContext } from "../index";

export interface GenerateBlogContentConfig {
  topic?: string;
  wordCount?: number;
  tone?: string;
  includeHeadings?: boolean;
  includeFaq?: boolean;
}

export async function generateBlogContent(
  context: WorkflowContext,
  config: GenerateBlogContentConfig
): Promise<ActionResult> {
  try {
    const { workspaceId, customPrompt, data } = context;

    // Get topic from config or previous node output
    const selectedTopic = data.selectedTopic as
      | { title: string; description: string }
      | undefined;
    const topic = config.topic ?? selectedTopic?.title;

    if (!topic) {
      return {
        success: false,
        error:
          "No topic provided. Run 'generate_topic' action first or provide a topic in config.",
      };
    }

    const {
      wordCount = 1200,
      tone = "professional",
      includeHeadings = true,
      includeFaq = false,
    } = config;

    const agent = createCMSAgent({
      workspaceId,
      userId: "workflow-system",
      userName: "Workflow Engine",
    });

    let prompt = `Write a comprehensive, SEO-optimized blog post in markdown format.

**Topic:** "${topic}"
**Target Word Count:** ${wordCount}-${wordCount + 300} words
**Tone:** ${tone}

`;

    if (customPrompt) {
      prompt += `**User Instructions:** ${customPrompt}\n\n`;
    }

    prompt += `**STRUCTURE REQUIREMENTS:**

1. **Introduction (100-150 words)**
   - Start with an attention-grabbing hook
   - Establish the problem or opportunity
   - Preview what readers will learn

2. **Main Content (${includeHeadings ? "3-5 major sections with ## headings" : "flowing paragraphs"})**
   - Each section should be 200-300 words
   - Use practical examples and tips
   - Use bullet points for scannability
   - Include actionable advice

3. **Conclusion (100-150 words)**
   - Summarize key takeaways
   - Include a clear call-to-action

${
  includeFaq
    ? `4. **FAQ Section**
   - Add 3-4 commonly asked questions about the topic
   - Format as ### Q: [Question] followed by answer`
    : ""
}

**FORMATTING:**
- Use markdown: **bold**, *italic*, \`code\`, > blockquotes
- Use proper heading hierarchy starting with ##
- Do NOT include H1 (title is handled separately)

**TONE GUIDELINES for "${tone}":**
${getToneGuidelines(tone)}

Write the complete, publication-ready article now:`;

    const response = await agent.generate([{ role: "user", content: prompt }]);

    const content = response.text ?? "";

    // Store content in context for next nodes
    context.data.content = content;
    context.data.title = topic;
    context.data.wordCount = countWords(content);

    return {
      success: true,
      output: {
        title: topic,
        contentLength: content.length,
        wordCount: context.data.wordCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function getToneGuidelines(tone: string): string {
  switch (tone.toLowerCase()) {
    case "casual":
      return "- Conversational and friendly\n- Use contractions and informal language\n- Add humor where appropriate";
    case "formal":
      return "- Formal and authoritative\n- Avoid contractions\n- Use precise, academic language";
    case "educational":
      return "- Clear and instructional\n- Break down complex concepts\n- Use examples and analogies";
    default:
      return "- Professional but approachable\n- Balance expertise with accessibility\n- Use active voice";
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}
