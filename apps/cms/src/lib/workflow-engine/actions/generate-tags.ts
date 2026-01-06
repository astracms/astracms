/**
 * Generate Tags Action
 *
 * Uses AI to suggest and create relevant tags for the blog post.
 */
import { db } from "@astra/db";
import { createCMSAgent } from "@/mastra";
import type { ActionResult, WorkflowContext } from "../index";

export interface GenerateTagsConfig {
  count?: number;
  autoCreate?: boolean;
}

export async function generateTags(
  context: WorkflowContext,
  config: GenerateTagsConfig
): Promise<ActionResult> {
  try {
    const { workspaceId, data } = context;
    const { count = 4, autoCreate = true } = config;

    const title = data.title as string;
    const content = data.content as string;

    if (!title && !content) {
      return {
        success: false,
        error: "No title or content available. Run content generation first.",
      };
    }

    // Get existing tags
    const existingTags = await db.tag.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    const agent = createCMSAgent({
      workspaceId,
      userId: "workflow-system",
      userName: "Workflow Engine",
    });

    const existingTagList =
      existingTags.length > 0
        ? `Existing tags in the workspace:\n${existingTags.map((t) => `- ${t.name}`).join("\n")}`
        : "No existing tags in the workspace.";

    const response = await agent.generate([
      {
        role: "user",
        content: `Select ${count} relevant tags for this blog post.

Title: "${title}"
${content ? `Content preview: ${content.slice(0, 500)}...` : ""}

${existingTagList}

Requirements:
- Choose from existing tags if they match
- If no suitable existing tags, suggest new ones
- Each tag should be 1-3 words
- Return only tag names, one per line
- No numbering or bullets`,
      },
    ]);

    const suggestedTags = (response.text ?? "")
      .split("\n")
      .map((t) => t.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter((t) => t.length > 0 && t.length < 50)
      .slice(0, count);

    // Match or create tags
    const selectedTags: Array<{ id: string; name: string; slug: string }> = [];

    for (const tagName of suggestedTags) {
      // Check if tag exists (case-insensitive)
      const existing = existingTags.find(
        (t) => t.name.toLowerCase() === tagName.toLowerCase()
      );

      if (existing) {
        selectedTags.push(existing);
      } else if (autoCreate) {
        // Create new tag
        const slug = tagName
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        try {
          const newTag = await db.tag.create({
            data: {
              name: tagName,
              slug,
              workspaceId,
            },
            select: { id: true, name: true, slug: true },
          });
          selectedTags.push(newTag);
        } catch (error) {
          // Slug might already exist, try to find it
          const existingBySlug = await db.tag.findFirst({
            where: { workspaceId, slug },
            select: { id: true, name: true, slug: true },
          });
          if (existingBySlug) {
            selectedTags.push(existingBySlug);
          }
        }
      }
    }

    context.data.tags = selectedTags;

    return {
      success: true,
      output: {
        tags: selectedTags.map((t) => t.name),
        count: selectedTags.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
