/**
 * Auto Blog Creation Tool
 *
 * Automatically creates a complete, SEO-optimized blog post from just a topic.
 * Handles title, content, category, tags, image, and meta description automatically.
 */
import { db } from "@astra/db";
import { markdownToHtml, markdownToTiptap } from "@astra/parser/tiptap";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { sanitizeHtml } from "@/utils/editor";
import { generateWithAI } from "../lib/ai-generator";

/**
 * Sanitize text for use in AI prompts - removes injection patterns
 */
function sanitizePromptInput(input: string): string {
  return (
    input
      // Remove quotes that could break prompt structure
      .replace(/["'`]/g, "")
      // Collapse multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      // Remove common injection patterns
      .replace(/ignore\s+all\s+previous\s+instructions/gi, "")
      .replace(/system\s*:/gi, "")
      .replace(/assistant\s*:/gi, "")
      // Limit length to prevent token abuse
      .slice(0, 1000)
      .trim()
  );
}

/**
 * Sanitize and validate a slug
 */
function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/'/g, "") // Remove apostrophes
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .slice(0, 100); // Limit length
}

/**
 * Create the auto blog creation tool
 */
export const createBlogAutoTool = (workspaceId: string) =>
  createTool({
    id: "create-blog-auto",
    description:
      "Automatically create a complete, SEO-optimized blog post from just a topic. Handles title generation, content writing, category selection, tag creation, image selection, and meta description - all in one command. Perfect for quick blog creation with minimal input.",
    inputSchema: z.object({
      topic: z.string().describe("The topic or subject for the blog post"),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Target SEO keywords to incorporate"),
      tone: z
        .enum([
          "professional",
          "casual",
          "friendly",
          "authoritative",
          "educational",
        ])
        .optional()
        .default("professional")
        .describe("Writing tone and style"),
      length: z
        .enum(["short", "medium", "long"])
        .optional()
        .default("medium")
        .describe(
          "Content length: short (800-1000), medium (1200-1500), long (1800-2000)"
        ),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      post: z
        .object({
          id: z.string(),
          slug: z.string(),
          title: z.string(),
          category: z.string(),
          tags: z.array(z.string()),
          wordCount: z.number(),
          editUrl: z.string(),
        })
        .optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const {
          topic,
          keywords = [],
          tone = "professional",
          length = "medium",
        } = context;

        console.log(
          "[AUTO BLOG] Starting automated blog creation for topic:",
          topic
        );

        // ===== STEP 1: Generate Title =====
        console.log("[AUTO BLOG] Step 1: Generating title...");
        const sanitizedTopic = sanitizePromptInput(topic);
        const titleText = await generateWithAI(
          `Generate ONE compelling, SEO-optimized blog post title for: "${sanitizedTopic}"

Requirements:
- Use power words (discover, master, ultimate, proven)
- Optimize for 40-60 characters
- Include relevant keywords naturally
- Make it specific and actionable

Return ONLY the title, nothing else.`,
          workspaceId,
          "blog-title-generation",
          5
        );

        const title = (titleText.trim() || topic).slice(0, 100);
        console.log("[AUTO BLOG] Generated title:", title);

        // ===== STEP 2: Auto-select or create category =====
        console.log("[AUTO BLOG] Step 2: Selecting category...");
        const categories = await db.category.findMany({
          where: { workspaceId },
          select: { id: true, name: true, slug: true },
        });

        let category: { id: string; name: string; slug: string };
        if (categories.length === 0) {
          // Create default category
          category = await db.category.create({
            data: {
              name: "General",
              slug: "general",
              description: "General blog posts and articles",
              workspaceId,
            },
          });
          console.log("[AUTO BLOG] Created default category: General");
        } else if (categories.length === 1) {
          // Use the only available category
          const firstCategory = categories[0];
          if (!firstCategory) {
            throw new Error("Category array unexpectedly empty");
          }
          category = firstCategory;
          console.log("[AUTO BLOG] Using category:", category.name);
        } else {
          // Use AI to select best matching category
          const categoryList = categories
            .map((c) => `- ${c.name} (${c.slug})`)
            .join("\n");
          const categoryText = await generateWithAI(
            `Given the blog post title "${title}" about "${topic}", which category is most appropriate?

Available categories:
${categoryList}

Return ONLY the category slug, nothing else.`,
            workspaceId,
            "blog-category-selection",
            3
          );

          const suggestedSlug = categoryText
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "");
          const matchedCategory = categories.find(
            (c) => c.slug === suggestedSlug
          );
          const selectedCategory = matchedCategory ?? categories[0];
          if (!selectedCategory) {
            throw new Error("No categories available in workspace");
          }
          category = selectedCategory;
          console.log("[AUTO BLOG] Selected category:", category.name);
        }

        // ===== STEP 3: Generate comprehensive content =====
        console.log("[AUTO BLOG] Step 3: Generating content...");
        const wordTarget =
          length === "short" ? 900 : length === "long" ? 1900 : 1400;
        const keywordContext =
          keywords.length > 0
            ? `\nTarget keywords to incorporate naturally: ${keywords.join(", ")}`
            : "";

        const contentText = await generateWithAI(
          `Write a comprehensive, SEO-optimized blog post in markdown format.

Title: "${title}"
Topic: "${topic}"
Tone: ${tone}
Target length: ${wordTarget} words${keywordContext}

STRUCTURE:
1. Hook introduction (100-150 words) - Start with attention-grabbing statement
2. Problem/Opportunity statement (50-100 words)
3. Main content (3-5 sections with ## headings, 200-300 words each)
4. Actionable conclusion (100-150 words) with clear call-to-action

REQUIREMENTS:
- Use markdown: **bold**, *italic*, bullet points, numbered lists
- Do NOT include title as H1 (handled separately)
- Start with ## for main headings
- Write in second person ("you")
- Include practical examples and tips
- Use transition words for flow
- Keep paragraphs short (3-4 sentences max)
- DO NOT include word count annotations like "(Word count: 248)" anywhere in the content
- Write continuously without mentioning word counts

SEO:
- Natural keyword incorporation (1-2% density)
- Front-load keywords in first 100 words
- Use descriptive headings,
          workspaceId,
          "blog-content-generation",
          50
- Optimize for featured snippets

Write the complete article now:`
        );

        const content =
          contentText ||
          `## Introduction\n\nThis is a comprehensive guide about ${topic}.\n\n## Conclusion\n\nNow you have a better understanding of ${topic}.`;
        const wordCount = content.split(/\s+/).length;
        console.log("[AUTO BLOG] Generated content:", wordCount, "words");

        // ===== STEP 4: Generate meta description =====
        console.log("[AUTO BLOG] Step 4: Generating meta description...");
        const descText = await generateWithAI(
          `Write an SEO-optimized meta description for a blog post titled "${title}" about "${topic}".

CRITICAL:
- EXACTLY 150-160 characters,
          workspaceId,
          "blog-description-generation",
          5
- Include primary keyword in first 80 characters
- Use action verbs (Learn, Discover, Master, Get)
- NO quotation marks
- Make it compelling

Return ONLY the description, nothing else.`
        );

        const rawDescription =
          descText.trim().replace(/^["']|["']$/g, "") ||
          `Learn about ${topic} in this comprehensive guide.`;
        const description =
          rawDescription.length > 160
            ? `${rawDescription.slice(0, 157)}...`
            : rawDescription;
        console.log(
          "[AUTO BLOG] Generated description:",
          description.length,
          "chars"
        );

        // ===== STEP 5: Generate and create tags =====
        console.log("[AUTO BLOG] Step 5: Generating tags...");
        const tagsText = await generateWithAI(
          `Generate 3-5 relevant tag names (1-2 words each) for a blog post about "${topic}".

Requirements:
- Concise (1-2 words)
- Relevant to the topic
- Mix of broad and specific tags
- Use lowercase

Return as comma-separated list, nothing else.`,
          workspaceId,
          "blog-tags-generation",
          3
        );

        const tagNames = (tagsText || "")
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0 && t.length < 30)
          .slice(0, 5);

        // Create or find tags
        const tagRecords = await Promise.all(
          tagNames.map(async (name) => {
            const slug = sanitizeSlug(name);
            return db.tag.upsert({
              where: { workspaceId_slug: { workspaceId, slug } },
              update: {},
              create: {
                name,
                slug,
                description: `Posts related to ${name}`,
                workspaceId,
              },
            });
          })
        );
        console.log("[AUTO BLOG] Created/found tags:", tagNames.join(", "));

        // ===== STEP 6: Auto-select cover image =====
        console.log("[AUTO BLOG] Step 6: Selecting cover image...");
        const keywords_for_image = [
          ...title.toLowerCase().split(/\s+/),
          ...topic.toLowerCase().split(/\s+/),
          ...keywords,
        ].filter((word) => word.length > 3);

        let coverImage: string | null = null;
        for (const keyword of keywords_for_image) {
          const image = await db.media.findFirst({
            where: {
              workspaceId,
              type: "image",
              name: { contains: keyword, mode: "insensitive" },
            },
            orderBy: { createdAt: "desc" },
            select: { url: true },
          });

          if (image) {
            coverImage = image.url;
            console.log(
              "[AUTO BLOG] Selected cover image matching keyword:",
              keyword
            );
            break;
          }
        }

        // Fallback to most recent image
        if (!coverImage) {
          const recentImage = await db.media.findFirst({
            where: { workspaceId, type: "image" },
            orderBy: { createdAt: "desc" },
            select: { url: true },
          });
          coverImage = recentImage?.url ?? null;
          if (coverImage) {
            console.log("[AUTO BLOG] Using most recent image as fallback");
          } else {
            console.log("[AUTO BLOG] No images available in media library");
          }
        }

        // ===== STEP 7: Get author =====
        const author = await db.author.findFirst({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
        });

        if (!author) {
          throw new Error(
            "No author found in workspace. Please create an author profile first."
          );
        }

        // ===== STEP 8: Convert markdown and create post =====
        console.log("[AUTO BLOG] Step 7: Creating post in database...");
        const htmlContent = await markdownToHtml(content);
        const cleanContent = sanitizeHtml(htmlContent);
        const contentJson = markdownToTiptap(content);
        const slug = sanitizeSlug(title);

        const post = await db.post.create({
          data: {
            title,
            slug,
            content: cleanContent,
            contentJson,
            description,
            categoryId: category.id,
            status: "draft",
            workspaceId,
            primaryAuthorId: author.id,
            authors: { connect: [{ id: author.id }] },
            tags: { connect: tagRecords.map((t) => ({ id: t.id })) },
            coverImage: coverImage ?? undefined,
            publishedAt: new Date(),
          },
        });

        console.log("[AUTO BLOG] Post created successfully:", post.id);

        // Get workspace slug for the edit URL
        const workspace = await db.organization.findUnique({
          where: { id: workspaceId },
          select: { slug: true },
        });

        return {
          success: true,
          post: {
            id: post.id,
            slug: post.slug,
            title: post.title,
            category: category.name,
            tags: tagNames,
            wordCount,
            editUrl: `/${workspace?.slug ?? workspaceId}/editor/p/${post.id}`,
          },
        };
      } catch (error) {
        console.error("[AUTO BLOG] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
