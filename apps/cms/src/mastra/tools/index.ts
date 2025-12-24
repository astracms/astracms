import { wrapToolsWithCreditCheck } from "@/lib/ai-tool-wrapper";
import type { CMSAgentContext } from "../agents/cms-agent";
import { createAddCategoryTool } from "./add-category";
import { createAddTagTool } from "./add-tag";
import { createAnalyzeWebsiteTool } from "./analyze-website";
import { createAutoSelectImageTool } from "./auto-select-image";
import { createContentStrategyTool } from "./content-strategy";
import { createBlogAutoTool } from "./create-blog-auto";
import { createCreatePostTool } from "./create-post";
import { createGetAnalyticsTool } from "./get-analytics";
import { createGetAuthorsTool } from "./get-authors";
import { createGetKnowledgeBaseTool } from "./get-knowledge-base";
import { createGetWorkspaceDetailsTool } from "./get-workspace-details";
import { createKeywordResearchTool } from "./keyword-research";
import { createListMediaTool } from "./list-media";
import { createListResourcesTool } from "./list-resources";
import { createSearchTool } from "./search";
import { createSEOAnalyzerTool } from "./seo-analyzer";
import { createUpdateKnowledgeBaseTool } from "./update-knowledge-base";
import { createUpdatePostTool } from "./update-post";
import { createWebSearchTool } from "./web-search";

// Re-export individual tool creators
export { createAddCategoryTool } from "./add-category";
export { createAddTagTool } from "./add-tag";
export { createAnalyzeWebsiteTool } from "./analyze-website";
export { createAutoSelectImageTool } from "./auto-select-image";
export { createContentStrategyTool } from "./content-strategy";
export { createBlogAutoTool } from "./create-blog-auto";
export { createCreatePostTool } from "./create-post";
export { createGetAnalyticsTool } from "./get-analytics";
export { createGetAuthorsTool } from "./get-authors";
export { createGetKnowledgeBaseTool } from "./get-knowledge-base";
export { createGetWorkspaceDetailsTool } from "./get-workspace-details";
export { createKeywordResearchTool } from "./keyword-research";
export { createListMediaTool } from "./list-media";
export { createListResourcesTool } from "./list-resources";
export { createReadabilitySuggestionsTool } from "./readability-suggestions";
export { createSearchTool } from "./search";
export { createSEOAnalyzerTool } from "./seo-analyzer";
export { createUpdateKnowledgeBaseTool } from "./update-knowledge-base";
export { createUpdatePostTool } from "./update-post";
export { createWebSearchTool } from "./web-search";

/**
 * Create all CMS tools scoped to a specific workspace
 */
export function createCMSTools(context: CMSAgentContext) {
  const { workspaceId } = context;

  const tools = {
    // Automation tools
    createBlogAuto: createBlogAutoTool(workspaceId),

    // Knowledge Base tools
    getKnowledgeBase: createGetKnowledgeBaseTool(workspaceId),
    updateKnowledgeBase: createUpdateKnowledgeBaseTool(workspaceId),
    analyzeWebsite: createAnalyzeWebsiteTool(workspaceId),

    // SEO & Strategy tools
    keywordResearch: createKeywordResearchTool(workspaceId),
    analyzeSEO: createSEOAnalyzerTool(),
    contentStrategy: createContentStrategyTool(workspaceId),

    // Content management tools
    addTag: createAddTagTool(workspaceId),
    addCategory: createAddCategoryTool(workspaceId),
    autoSelectImage: createAutoSelectImageTool(workspaceId),
    createPost: createCreatePostTool(workspaceId),
    updatePost: createUpdatePostTool(workspaceId),

    // Discovery tools
    search: createSearchTool(workspaceId),
    listResources: createListResourcesTool(workspaceId),
    listMedia: createListMediaTool(workspaceId),

    // Analytics & info tools
    getAnalytics: createGetAnalyticsTool(workspaceId),
    getAuthors: createGetAuthorsTool(workspaceId),
    getWorkspaceDetails: createGetWorkspaceDetailsTool(context),

    // Research tools
    webSearch: createWebSearchTool(),
  };

  // Wrap all tools with credit checking middleware
  return wrapToolsWithCreditCheck(tools, workspaceId);
}

/**
 * Type for the CMS tools object
 */
export type CMSTools = ReturnType<typeof createCMSTools>;
