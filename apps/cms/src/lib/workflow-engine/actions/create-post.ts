/**
 * Create Post Action
 *
 * Creates the final blog post in the database using accumulated data.
 */
import { db } from "@astra/db";
import { markdownToHtml, markdownToTiptap } from "@astra/parser/tiptap";
import { createCMSAgent } from "@/mastra";
import type { ActionResult, WorkflowContext } from "../index";

export interface CreatePostConfig {
  status?: "draft" | "published";
  publishNow?: boolean;
  generateDescription?: boolean;
}

export async function createPost(
  context: WorkflowContext,
  config: CreatePostConfig
): Promise<ActionResult> {
  try {
    const { workspaceId, data, customPrompt } = context;
    const {
      status = "draft",
      publishNow = false,
      generateDescription = true,
    } = config;

    const title = data.title as string;
    const content = data.content as string;
    const category = data.category as
      | { id: string; name: string; slug: string }
      | undefined;
    const tags = data.tags as
      | Array<{ id: string; name: string; slug: string }>
      | undefined;

    if (!title) {
      return { success: false, error: "No title available" };
    }

    if (!content) {
      return { success: false, error: "No content available" };
    }

    if (!category) {
      return { success: false, error: "No category selected" };
    }

    // Get primary author
    const author = await db.author.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    if (!author) {
      return {
        success: false,
        error: "No author found in workspace. Please create an author first.",
      };
    }

    // Generate SEO description if needed
    let description = "";
    if (generateDescription) {
      const agent = createCMSAgent({
        workspaceId,
        userId: "workflow-system",
        userName: "Workflow Engine",
      });

      const response = await agent.generate([
        {
          role: "user",
          content: `Write an SEO-optimized meta description for this blog post.

Title: "${title}"
Content preview: ${content.slice(0, 500)}
${customPrompt ? `User context: ${customPrompt}` : ""}

Requirements:
- EXACTLY 150-160 characters
- Include primary keyword in first 80 characters
- Use action verbs (Learn, Discover, Master)
- No quotes or special characters

Return ONLY the meta description, nothing else:`,
        },
      ]);

      description = (response.text ?? "").trim().replace(/^["']|["']$/g, "");

      // Ensure length limits
      if (description.length > 160) {
        description = `${description.slice(0, 157)}...`;
      }
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.post.findFirst({
        where: { workspaceId, slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    // Convert markdown to HTML and TipTap JSON
    const htmlContent = await markdownToHtml(content);
    const cleanContent = sanitizeHtml(htmlContent);
    const contentJson = markdownToTiptap(content);

    // Create the post
    const post = await db.post.create({
      data: {
        title,
        slug,
        content: cleanContent,
        contentJson,
        description: description || `Learn about ${title}`,
        categoryId: category.id,
        status: publishNow ? "published" : status,
        workspaceId,
        primaryAuthorId: author.id,
        authors: {
          connect: [{ id: author.id }],
        },
        tags:
          tags && tags.length > 0
            ? { connect: tags.map((t) => ({ id: t.id })) }
            : undefined,
        publishedAt: publishNow ? new Date() : new Date(),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
      },
    });

    context.data.post = post;
    context.data.postUrl = `/posts/${post.slug}/edit`;

    return {
      success: true,
      output: {
        post,
        editUrl: `/posts/${post.slug}/edit`,
        category: category.name,
        tags: tags?.map((t) => t.name) ?? [],
        wordCount: data.wordCount,
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
 * Basic HTML sanitization
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}
