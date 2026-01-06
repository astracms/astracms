/**
 * AI Workflow Engine
 *
 * Executes AI workflows by traversing the node graph and running actions.
 * Supports blog generation workflows with custom prompts.
 */

import { db } from "@astra/db";

// Local type definitions to avoid import issues
interface WorkflowNodeRecord {
  id: string;
  workflowId: string;
  type: string;
  actionType: string | null;
  label: string;
  config: unknown;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowEdgeRecord {
  id: string;
  workflowId: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string | null;
  createdAt: Date;
}

interface WorkflowRecord {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  status: string;
  triggerType: string;
  triggerConfig: unknown;
  customPrompt: string | null;
  isActive: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

import { createPost } from "./actions/create-post";
import { generateBlogContent } from "./actions/generate-blog-content";
import { generateBlogTopic } from "./actions/generate-blog-topic";
import { generateTags } from "./actions/generate-tags";
import { selectCategory } from "./actions/select-category";

export interface WorkflowContext {
  workspaceId: string;
  runId: string;
  customPrompt?: string | null;
  logs: WorkflowLog[];
  data: Record<string, unknown>; // Shared data between nodes
}

export interface WorkflowLog {
  nodeId: string;
  nodeLabel: string;
  status: "started" | "completed" | "failed";
  message?: string;
  timestamp: Date;
  duration?: number;
  output?: unknown;
}

export interface ActionResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

type WorkflowWithRelations = WorkflowRecord & {
  nodes: WorkflowNodeRecord[];
  edges: WorkflowEdgeRecord[];
};

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  workflow: WorkflowWithRelations,
  runId: string,
  workspaceId: string
): Promise<void> {
  const context: WorkflowContext = {
    workspaceId,
    runId,
    customPrompt: workflow.customPrompt,
    logs: [],
    data: {},
  };

  try {
    // Build adjacency list for traversal
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));
    const adjacency = new Map<string, string[]>();

    for (const node of workflow.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of workflow.edges) {
      const sources = adjacency.get(edge.sourceNodeId) ?? [];
      sources.push(edge.targetNodeId);
      adjacency.set(edge.sourceNodeId, sources);
    }

    // Find trigger node (entry point)
    const triggerNodes = workflow.nodes.filter((n) => n.type === "trigger");
    if (triggerNodes.length === 0) {
      throw new Error("Workflow has no trigger node");
    }

    // Execute nodes in topological order starting from trigger
    const visited = new Set<string>();
    const queue = triggerNodes.map((n) => n.id);

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId || visited.has(nodeId)) continue;

      visited.add(nodeId);
      const node = nodeMap.get(nodeId);

      if (!node) continue;

      // Execute the node
      const result = await executeNode(node, context);

      if (!result.success) {
        // Node failed - stop execution
        await updateRunStatus({
          runId,
          status: "failed",
          logs: context.logs,
          error: result.error,
        });
        return;
      }

      // Add next nodes to queue
      const nextNodes = adjacency.get(nodeId) ?? [];
      for (const nextId of nextNodes) {
        if (!visited.has(nextId)) {
          queue.push(nextId);
        }
      }
    }

    // All nodes completed successfully
    await updateRunStatus({
      runId,
      status: "completed",
      logs: context.logs,
      result: context.data,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[WORKFLOW ENGINE] Execution error:", error);
    await updateRunStatus({
      runId,
      status: "failed",
      logs: context.logs,
      error: errorMessage,
    });
  }
}

/**
 * Execute a single node
 */
async function executeNode(
  node: WorkflowNodeRecord,
  context: WorkflowContext
): Promise<ActionResult> {
  const startTime = Date.now();

  context.logs.push({
    nodeId: node.id,
    nodeLabel: node.label,
    status: "started",
    timestamp: new Date(),
  });

  try {
    let result: ActionResult;

    // Handle trigger nodes (just pass through)
    if (node.type === "trigger") {
      result = { success: true, output: { triggered: true } };
    }
    // Handle action nodes
    else if (node.type === "action") {
      result = await executeAction(node, context);
    }
    // Handle condition nodes (future)
    else if (node.type === "condition") {
      result = { success: true, output: { evaluated: true } };
    }
    // Unknown node type
    else {
      result = { success: false, error: `Unknown node type: ${node.type}` };
    }

    const duration = Date.now() - startTime;

    // Update log entry
    const logEntry = context.logs.at(-1);
    if (logEntry) {
      logEntry.status = result.success ? "completed" : "failed";
      logEntry.duration = duration;
      logEntry.output = result.output;
      logEntry.message = result.error;
    }

    // Save run progress - serialize logs for Prisma JSON
    await db.aiWorkflowRun.update({
      where: { id: context.runId },
      data: { logs: JSON.parse(JSON.stringify(context.logs)) },
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const duration = Date.now() - startTime;

    const logEntry = context.logs.at(-1);
    if (logEntry) {
      logEntry.status = "failed";
      logEntry.duration = duration;
      logEntry.message = errorMessage;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Execute an action based on actionType
 */
async function executeAction(
  node: WorkflowNodeRecord,
  context: WorkflowContext
): Promise<ActionResult> {
  const config = (node.config as Record<string, unknown>) ?? {};

  switch (node.actionType) {
    case "generate_topic":
      return generateBlogTopic(context, config);

    case "generate_content":
      return generateBlogContent(context, config);

    case "select_category":
      return selectCategory(context, config);

    case "generate_tags":
      return generateTags(context, config);

    case "create_post":
      return createPost(context, config);

    case "delay": {
      const delayMs = (config.durationMs as number) ?? 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return { success: true, output: { delayed: delayMs } };
    }

    default:
      return {
        success: false,
        error: `Unknown action type: ${node.actionType}`,
      };
  }
}

/**
 * Update workflow run status
 */
interface UpdateRunStatusOptions {
  runId: string;
  status: "pending" | "running" | "completed" | "failed";
  logs: WorkflowLog[];
  error?: string;
  result?: unknown;
}

async function updateRunStatus(options: UpdateRunStatusOptions): Promise<void> {
  const { runId, status, logs, error, result } = options;
  await db.aiWorkflowRun.update({
    where: { id: runId },
    data: {
      status,
      completedAt: new Date(),
      logs: JSON.parse(JSON.stringify(logs)),
      error,
      result: result ? JSON.parse(JSON.stringify(result)) : undefined,
    },
  });
}
