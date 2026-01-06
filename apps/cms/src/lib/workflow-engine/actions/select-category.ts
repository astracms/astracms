/**
 * Select Category Action
 *
 * Selects or creates an appropriate category for the blog post.
 */
import { db } from "@astra/db";
import { createCMSAgent } from "@/mastra";
import type { ActionResult, WorkflowContext } from "../index";

export interface SelectCategoryConfig {
  categorySlug?: string;
  autoCreate?: boolean;
}

export async function selectCategory(
  context: WorkflowContext,
  config: SelectCategoryConfig
): Promise<ActionResult> {
  try {
    const { workspaceId, data } = context;
    const { categorySlug, autoCreate = true } = config;

    // If specific category slug provided, use it
    if (categorySlug) {
      const category = await db.category.findFirst({
        where: { workspaceId, slug: categorySlug },
        select: { id: true, name: true, slug: true },
      });

      if (category) {
        context.data.category = category;
        return { success: true, output: { category } };
      }

      if (!autoCreate) {
        return {
          success: false,
          error: `Category '${categorySlug}' not found`,
        };
      }
    }

    // Get existing categories
    const categories = await db.category.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    // If no categories exist, create a default one
    if (categories.length === 0) {
      const defaultCategory = await db.category.create({
        data: {
          name: "General",
          slug: "general",
          workspaceId,
        },
        select: { id: true, name: true, slug: true },
      });

      context.data.category = defaultCategory;
      return {
        success: true,
        output: { category: defaultCategory, created: true },
      };
    }

    // Use AI to select best matching category
    const title = data.title as string;
    const content = data.content as string;

    if (title && categories.length > 1) {
      const agent = createCMSAgent({
        workspaceId,
        userId: "workflow-system",
        userName: "Workflow Engine",
      });

      const categoryList = categories
        .map((c) => `- ${c.name} (slug: ${c.slug})`)
        .join("\n");

      const response = await agent.generate([
        {
          role: "user",
          content: `Given the blog post title "${title}", which category is most appropriate?

Available categories:
${categoryList}

Respond with ONLY the slug of the best matching category. No explanation.`,
        },
      ]);

      const suggestedSlug = (response.text ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

      const matchedCategory = categories.find((c) => c.slug === suggestedSlug);
      if (matchedCategory) {
        context.data.category = matchedCategory;
        return { success: true, output: { category: matchedCategory } };
      }
    }

    // Default to first category
    const selectedCategory = categories[0];
    if (selectedCategory) {
      context.data.category = selectedCategory;
      return { success: true, output: { category: selectedCategory } };
    }

    return { success: false, error: "No category available" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
