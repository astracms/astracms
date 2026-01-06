"use client";

import { cn } from "@astra/ui/lib/utils";
import {
  ArticleIcon,
  CheckIcon,
  ClockIcon,
  FolderIcon,
  GearIcon,
  GlobeIcon,
  HandIcon,
  LightbulbIcon,
  RssIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";

const actionIcons: Record<string, typeof HandIcon> = {
  manual: HandIcon,
  scheduled: ClockIcon,
  webhook: GlobeIcon,
  rss_feed: RssIcon,
  generate_topic: LightbulbIcon,
  generate_content: ArticleIcon,
  select_category: FolderIcon,
  generate_tags: TagIcon,
  create_post: CheckIcon,
};

const nodeTypeColors: Record<string, string> = {
  trigger: "border-blue-500 bg-blue-50 dark:bg-blue-950",
  action: "border-green-500 bg-green-50 dark:bg-green-950",
  condition: "border-amber-500 bg-amber-50 dark:bg-amber-950",
};

const nodeTypeHeaderColors: Record<string, string> = {
  trigger: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  action: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  condition:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  nodeType: string;
  actionType: string;
  config?: Record<string, unknown>;
}

type WorkflowNode = Node<WorkflowNodeData, "workflow">;

export const WorkflowNode = memo(function WorkflowNode({
  data,
  selected,
}: NodeProps<WorkflowNode>) {
  const nodeData = data as WorkflowNodeData;
  const Icon = actionIcons[nodeData.actionType] ?? GearIcon;
  const nodeType = nodeData.nodeType ?? "action";

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border-2 shadow-md transition-all",
        nodeTypeColors[nodeType] ?? nodeTypeColors.action,
        selected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-t-md px-3 py-2",
          nodeTypeHeaderColors[nodeType] ?? nodeTypeHeaderColors.action
        )}
      >
        <Icon className="h-4 w-4" weight="bold" />
        <span className="font-medium text-sm capitalize">{nodeType}</span>
      </div>

      {/* Content */}
      <div className="bg-background/80 px-3 py-3">
        <p className="font-semibold text-sm">{nodeData.label}</p>
        {nodeData.config && Object.keys(nodeData.config).length > 0 && (
          <p className="mt-1 line-clamp-1 text-muted-foreground text-xs">
            {formatConfig(nodeData.config)}
          </p>
        )}
      </div>

      {/* Handles */}
      {nodeType !== "trigger" && (
        <Handle
          className="h-3! w-3! border-2! border-background! bg-muted-foreground!"
          position={Position.Top}
          type="target"
        />
      )}
      <Handle
        className="h-3! w-3! border-2! border-background! bg-muted-foreground!"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
});

function formatConfig(config: Record<string, unknown>): string {
  const entries = Object.entries(config)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${String(v)}`);
  return entries.join(", ");
}
