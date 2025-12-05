import { ToolLoopAgent, InferAgentUIMessage } from "ai";
import { openrouter } from "@/lib/ai/model";
import { systemPrompt, type SystemPromptParams } from "@/lib/ai/prompt";
import {
	createAddTagTool,
	createAddCategoryTool,
	createCreatePostTool,
	createSearchTool,
	createUpdatePostTool,
	createGetAnalyticsTool,
	createListResourcesTool,
} from "@/lib/ai/tools";

/**
 * Create a CMS Agent instance with the given context
 */



export function createCMSAgent(context: SystemPromptParams) {
	const { userName, workspaceId } = context;

	return new ToolLoopAgent({
		model: openrouter.chat("openai/gpt-oss-20b:free"),
		instructions: systemPrompt(context),
		tools: {
			addTag: createAddTagTool(workspaceId),
			addCategory: createAddCategoryTool(workspaceId),
			createPost: createCreatePostTool(workspaceId),
			search: createSearchTool(workspaceId),
			updatePost: createUpdatePostTool(workspaceId),
			getAnalytics: createGetAnalyticsTool(workspaceId),
			listResources: createListResourcesTool(workspaceId),
		},
	});
}

// Export the agent type for use in API routes and components
export type CMSAgent = ReturnType<typeof createCMSAgent>;

// Export the inferred UI message type for type-safe frontend usage
export type CMSAgentUIMessage = InferAgentUIMessage<typeof createCMSAgent>;
