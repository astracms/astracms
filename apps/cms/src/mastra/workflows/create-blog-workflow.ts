/**
 * Blog Creation Workflow
 *
 * A comprehensive workflow for creating blog posts step-by-step:
 * 1. Generate title suggestions from topic
 * 2. Select a category
 * 3. Generate content
 * 4. Generate SEO description
 * 5. Select cover image from media library
 * 6. Select tags
 * 7. Create the final post
 */
import { db } from "@astra/db";
import { markdownToHtml, markdownToTiptap } from "@astra/parser/tiptap";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Sanitize HTML content (basic implementation)
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

// ============================================================================
// STEP 1: Generate Title Suggestions
// ============================================================================
const generateTitlesStep = createStep({
  id: "generate-titles",
  description: "Generate compelling title suggestions from the given topic",
  inputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    titles: z.array(z.string()),
    selectedTitle: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const agent = mastra?.getAgent("cmsAgent");
    if (!agent) {
      return {
        topic: inputData.topic,
        workspaceId: inputData.workspaceId,
        titles: [inputData.topic],
        selectedTitle: inputData.topic,
      };
    }

    const response = await agent.generate([
      {
        role: "user",
        content: `Generate 5 compelling, SEO-optimized blog post titles for: "${inputData.topic}"

Requirements:
- Use power words and emotional triggers (discover, master, ultimate, proven, secret)
- Optimize for 40-60 characters (ideal for search results)
- Include proven formats:
  * "How to [Achieve Benefit]: [Number] Proven Strategies"
  * "The Ultimate Guide to [Topic] for [Audience]"
  * "[Number] [Topic] Mistakes That Are Costing You [Outcome]"
  * "[Action Verb] [Topic] Like a Pro: [Benefit]"
- Naturally incorporate relevant keywords
- Focus on click-through appeal and user intent
- Make titles specific, not generic

Return ONLY the titles, one per line, no numbering or formatting.`,
      },
    ]);

    const titles = (response.text ?? "")
      .split("\n")
      .map((t) => t.replace(/^\d+\.\s*/, "").trim())
      .filter((t) => t.length > 0)
      .slice(0, 5);

    return {
      topic: inputData.topic,
      workspaceId: inputData.workspaceId,
      titles: titles.length > 0 ? titles : [inputData.topic],
      selectedTitle: titles[0] ?? inputData.topic,
    };
  },
});

// ============================================================================
// STEP 2: Select Category
// ============================================================================
const selectCategoryStep = createStep({
  id: "select-category",
  description: "Fetch available categories and select one for the post",
  inputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    titles: z.array(z.string()),
    selectedTitle: z.string().optional(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    titles: z.array(z.string()),
    selectedTitle: z.string(),
    categories: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
      })
    ),
    selectedCategorySlug: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const { workspaceId, topic, titles, selectedTitle } = inputData;
    const title = selectedTitle ?? titles[0] ?? topic;

    // Fetch available categories
    const categories = await db.category.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    if (categories.length === 0) {
      // Create a default "General" category if none exist
      const defaultCategory = await db.category.create({
        data: {
          name: "General",
          slug: "general",
          workspaceId,
        },
      });
      categories.push({
        id: defaultCategory.id,
        name: defaultCategory.name,
        slug: defaultCategory.slug,
      });
    }

    // Use AI to select the most appropriate category
    let selectedCategorySlug = categories[0]?.slug ?? "general";

    const agent = mastra?.getAgent("cmsAgent");
    if (agent && categories.length > 1) {
      const categoryList = categories
        .map((c) => `- ${c.name} (${c.slug})`)
        .join("\n");
      const response = await agent.generate([
        {
          role: "user",
          content: `Given the blog post title "${title}" about "${topic}", which category is most appropriate?\n\nAvailable categories:\n${categoryList}\n\nRespond with only the slug of the best matching category.`,
        },
      ]);

      const suggestedSlug = (response.text ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");
      const matchedCategory = categories.find((c) => c.slug === suggestedSlug);
      if (matchedCategory) {
        selectedCategorySlug = matchedCategory.slug;
      }
    }

    return {
      topic,
      workspaceId,
      titles,
      selectedTitle: title,
      categories,
      selectedCategorySlug,
    };
  },
});

// ============================================================================
// STEP 3: Generate Content
// ============================================================================
const generateContentStep = createStep({
  id: "generate-content",
  description: "Generate markdown content for the blog post",
  inputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    titles: z.array(z.string()),
    selectedTitle: z.string(),
    categories: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
      })
    ),
    selectedCategorySlug: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const { topic, workspaceId, selectedTitle, selectedCategorySlug } =
      inputData;

    const agent = mastra?.getAgent("cmsAgent");
    let content = `# ${selectedTitle}\n\nThis is a draft blog post about ${topic}.`;

    if (agent) {
      const response = await agent.generate([
        {
          role: "user",
          content: `Write a comprehensive, SEO-optimized blog post in markdown format.

Title: "${selectedTitle}"
Topic: "${topic}"

STRUCTURE:
1. Hook introduction (100-150 words)
   - Start with attention-grabbing statement, question, or statistic
   - Establish the problem or opportunity
   - Preview what readers will learn

2. Problem/Opportunity Statement (50-100 words)
   - Clearly define the challenge or goal
   - Make it relatable to the reader

3. Main Content (3-5 major sections with ## headings)
   - Each section should be 200-300 words
   - Use ### for subsections within major sections
   - Break up long paragraphs (max 3-4 sentences each)

4. Actionable Conclusion (100-150 words)
   - Summarize key takeaways
   - Include clear call-to-action
   - Inspire next steps

CONTENT REQUIREMENTS:
- Length: 1200-1500 words minimum
- Include specific, practical examples and tips
- Use bullet points (•) and numbered lists for scannability
- Add relevant statistics, data, or research when applicable
- Write in second person ("you") for engagement
- Use transition words for flow (however, therefore, additionally, etc.)
- Include action verbs and concrete language
- Avoid jargon unless necessary, then explain it

SEO REQUIREMENTS:
- Natural keyword incorporation (1-2% density)
- Front-load important keywords in first 100 words
- Use descriptive, keyword-rich headings
- Include semantic and LSI keywords related to the topic
- Optimize for featured snippets (use clear, concise answers)
- Use questions as headings where appropriate

FORMAT:
- Use markdown formatting: **bold**, *italic*, > blockquotes, \`code\`
- Do NOT include the title as H1 (it's handled separately)
- Use proper heading hierarchy starting with ##
- Add horizontal rules (---) between major sections if needed

TONE & STYLE:
- Professional but conversational
- Authoritative yet approachable
- Educational and helpful
- Confident without being arrogant

Write the complete, publication-ready article now:`,
        },
      ]);

      content = response.text ?? content;
    }

    return {
      topic,
      workspaceId,
      selectedTitle,
      selectedCategorySlug,
      content,
    };
  },
});

// ============================================================================
// STEP 4: Generate Description
// ============================================================================
const generateDescriptionStep = createStep({
  id: "generate-description",
  description: "Generate SEO-optimized meta description",
  inputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
    description: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const { topic, workspaceId, selectedTitle, selectedCategorySlug, content } =
      inputData;

    const agent = mastra?.getAgent("cmsAgent");
    let description = `Learn about ${topic} in this comprehensive guide.`;

    if (agent) {
      const response = await agent.generate([
        {
          role: "user",
          content: `Write an SEO-optimized meta description for this blog post.

Title: "${selectedTitle}"
Topic: "${topic}"
Content preview: ${content.slice(0, 500)}

CRITICAL REQUIREMENTS:
- EXACTLY 150-160 characters (this is a hard limit for search results)
- Include primary keyword naturally in first 80 characters
- Create curiosity or promise specific value
- Use active voice and action verbs (Learn, Discover, Master, Get)
- NO quotation marks or special characters
- Make it click-worthy but not clickbait
- Should accurately represent the content

PROVEN FORMATS (choose one that fits):
1. "Learn how to [benefit] with [method]. Discover [value] and [outcome]."
2. "Master [topic] in [timeframe]. Get [specific benefit] with our [method]."
3. "[Action verb] [benefit] using [method]. [Number] proven tips for [audience]."
4. "Discover [number] [topic] strategies that [outcome]. [Benefit] starts here."

EXAMPLES:
- "Learn how to boost SEO rankings with keyword research. Discover proven strategies and actionable tips to drive organic traffic."
- "Master content marketing in 30 days. Get step-by-step guidance to create engaging posts that convert readers into customers."

Return ONLY the meta description text, nothing else. No quotes, no labels, just the description:`,
        },
      ]);

      const rawDescription = (response.text ?? "")
        .trim()
        .replace(/^["']|["']$/g, "");

      // Ensure description is within limits
      description =
        rawDescription.length > 160
          ? `${rawDescription.slice(0, 157)}...`
          : rawDescription || description;
    }

    return {
      topic,
      workspaceId,
      selectedTitle,
      selectedCategorySlug,
      content,
      description,
    };
  },
});

// ============================================================================
// STEP 5: Select Cover Image from Media Library
// ============================================================================
const selectCoverImageStep = createStep({
  id: "select-cover-image",
  description:
    "Auto-select a cover image from the media library based on keywords",
  inputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
    description: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
    description: z.string(),
    coverImage: z.string().nullable(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const {
      topic,
      workspaceId,
      selectedTitle,
      selectedCategorySlug,
      content,
      description,
    } = inputData;

    // Extract keywords from title and topic
    const keywords = [
      ...selectedTitle.toLowerCase().split(/\s+/),
      ...topic.toLowerCase().split(/\s+/),
    ].filter((word) => word.length > 3);

    // Try to find a matching image
    let coverImage: string | null = null;

    for (const keyword of keywords) {
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
        break;
      }
    }

    // Fallback to most recent image if no match found
    if (!coverImage) {
      const recentImage = await db.media.findFirst({
        where: {
          workspaceId,
          type: "image",
        },
        orderBy: { createdAt: "desc" },
        select: { url: true },
      });

      coverImage = recentImage?.url ?? null;
    }

    return {
      topic,
      workspaceId,
      selectedTitle,
      selectedCategorySlug,
      content,
      description,
      coverImage,
    };
  },
});

// ============================================================================
// STEP 6: Select Tags
// ============================================================================
const selectTagsStep = createStep({
  id: "select-tags",
  description: "Suggest and select relevant tags for the post",
  inputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
    description: z.string(),
    coverImage: z.string().nullable(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
    description: z.string(),
    coverImage: z.string().nullable(),
    selectedTags: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const {
      topic,
      workspaceId,
      selectedTitle,
      selectedCategorySlug,
      content,
      description,
      coverImage,
    } = inputData;

    // Fetch existing tags
    const existingTags = await db.tag.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    });

    const selectedTags: string[] = [];

    const agent = mastra?.getAgent("cmsAgent");
    if (agent) {
      const tagList =
        existingTags.length > 0
          ? `Existing tags:\n${existingTags.map((t) => `- ${t.name}`).join("\n")}`
          : "No existing tags available.";

      const response = await agent.generate([
        {
          role: "user",
          content: `Select 2-4 relevant tags for this blog post.

Title: "${selectedTitle}"
Topic: "${topic}"

${tagList}

Requirements:
- Choose from existing tags if they match
- If no suitable existing tags, suggest new tag names
- Return only the tag names, one per line
- Keep tags concise (1-3 words each)`,
        },
      ]);

      const suggestedTags = (response.text ?? "")
        .split("\n")
        .map((t) => t.replace(/^[-*]\s*/, "").trim())
        .filter((t) => t.length > 0 && t.length < 50)
        .slice(0, 4);

      for (const tagName of suggestedTags) {
        // Check if tag exists
        const existing = existingTags.find(
          (t) => t.name.toLowerCase() === tagName.toLowerCase()
        );

        if (existing) {
          selectedTags.push(existing.name);
        } else {
          // Create new tag
          const newTag = await db.tag.create({
            data: {
              name: tagName,
              slug: generateSlug(tagName),
              workspaceId,
            },
          });
          selectedTags.push(newTag.name);
        }
      }
    }

    return {
      topic,
      workspaceId,
      selectedTitle,
      selectedCategorySlug,
      content,
      description,
      coverImage,
      selectedTags,
    };
  },
});

// ============================================================================
// STEP 7: Create Post
// ============================================================================
const createPostStep = createStep({
  id: "create-post",
  description: "Create the final blog post as a draft",
  inputSchema: z.object({
    topic: z.string(),
    workspaceId: z.string(),
    selectedTitle: z.string(),
    selectedCategorySlug: z.string(),
    content: z.string(),
    description: z.string(),
    coverImage: z.string().nullable(),
    selectedTags: z.array(z.string()),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    post: z
      .object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
      })
      .optional(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      return {
        success: false,
        error: "Input data not found",
      };
    }

    const {
      workspaceId,
      selectedTitle,
      selectedCategorySlug,
      content,
      description,
      coverImage,
      selectedTags,
    } = inputData;

    try {
      // Validate category exists
      const category = await db.category.findFirst({
        where: { slug: selectedCategorySlug, workspaceId },
      });

      if (!category) {
        return {
          success: false,
          error: `Category '${selectedCategorySlug}' not found.`,
        };
      }

      // Find tags
      let tagConnect: { id: string }[] = [];
      if (selectedTags.length > 0) {
        const foundTags = await db.tag.findMany({
          where: {
            workspaceId,
            name: { in: selectedTags },
          },
        });
        tagConnect = foundTags.map((t: { id: string }) => ({
          id: t.id,
        }));
      }

      // Generate unique slug
      const slug = generateSlug(selectedTitle);

      // Get first author in workspace
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

      // Convert markdown to HTML and TipTap JSON
      const htmlContent = await markdownToHtml(content);
      const cleanContent = sanitizeHtml(htmlContent);
      const contentJson = markdownToTiptap(content);

      // Create the post
      const post = await db.post.create({
        data: {
          title: selectedTitle,
          slug,
          content: cleanContent,
          contentJson,
          categoryId: category.id,
          status: "draft",
          workspaceId,
          primaryAuthorId: author.id,
          authors: {
            connect: [{ id: author.id }],
          },
          tags: tagConnect.length > 0 ? { connect: tagConnect } : undefined,
          description,
          coverImage: coverImage ?? undefined,
          publishedAt: new Date(),
        },
      });

      return {
        success: true,
        post: { id: post.id, slug: post.slug, title: post.title },
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// ============================================================================
// COMPLETE WORKFLOW
// ============================================================================
/**
 * Complete blog creation workflow
 * Takes a topic and creates a full blog post through all steps
 */
const createBlogWorkflow = createWorkflow({
  id: "create-blog-workflow",
  inputSchema: z.object({
    topic: z.string().describe("The topic to create a blog post about"),
    workspaceId: z.string().describe("The workspace ID"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    post: z
      .object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
      })
      .optional(),
    error: z.string().optional(),
  }),
})
  .then(generateTitlesStep)
  .then(selectCategoryStep)
  .then(generateContentStep)
  .then(generateDescriptionStep)
  .then(selectCoverImageStep)
  .then(selectTagsStep)
  .then(createPostStep);

createBlogWorkflow.commit();

export { createBlogWorkflow };
