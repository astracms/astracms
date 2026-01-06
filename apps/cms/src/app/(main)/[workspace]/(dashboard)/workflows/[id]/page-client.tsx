"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addEdge,
    Background,
    type Connection,
    Controls,
    type Edge,
    type EdgeTypes,
    MarkerType,
    MiniMap,
    type Node,
    type NodeTypes,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import { Input } from "@astra/ui/components/input";
import { Label } from "@astra/ui/components/label";
import { ScrollArea } from "@astra/ui/components/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@astra/ui/components/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@astra/ui/components/sheet";
import { Skeleton } from "@astra/ui/components/skeleton";
import { Textarea } from "@astra/ui/components/textarea";
import {
    ArrowLeftIcon,
    ArticleIcon,
    CheckIcon,
    ClockIcon,
    FloppyDiskIcon,
    FolderIcon,
    GearIcon,
    GlobeIcon,
    HandIcon,
    LightbulbIcon,
    ListBulletsIcon,
    PlayIcon,
    PlusIcon,
    RssIcon,
    TagIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatedEdge } from "@/components/workflows/workflow-edge";
import { WorkflowNode } from "@/components/workflows/workflow-node";

// Node types definition
const nodeTypes: NodeTypes = {
    workflow: WorkflowNode,
};

const edgeTypes: EdgeTypes = {
    animated: AnimatedEdge,
};

// Available node templates
const nodeTemplates = [
    {
        category: "Triggers",
        items: [
            {
                type: "trigger",
                actionType: "manual",
                label: "Manual Trigger",
                icon: HandIcon,
            },
            {
                type: "trigger",
                actionType: "scheduled",
                label: "Scheduled",
                icon: ClockIcon,
            },
            {
                type: "trigger",
                actionType: "rss_feed",
                label: "RSS Feed",
                icon: RssIcon,
            },
            {
                type: "trigger",
                actionType: "webhook",
                label: "Webhook",
                icon: GlobeIcon,
            },
        ],
    },
    {
        category: "Actions",
        items: [
            {
                type: "action",
                actionType: "generate_topic",
                label: "Generate Topic",
                icon: LightbulbIcon,
            },
            {
                type: "action",
                actionType: "generate_content",
                label: "Generate Content",
                icon: ArticleIcon,
            },
            {
                type: "action",
                actionType: "select_category",
                label: "Select Category",
                icon: FolderIcon,
            },
            {
                type: "action",
                actionType: "generate_tags",
                label: "Generate Tags",
                icon: TagIcon,
            },
            {
                type: "action",
                actionType: "create_post",
                label: "Create Post",
                icon: CheckIcon,
            },
        ],
    },
];

interface WorkflowData {
    id: string;
    name: string;
    description: string | null;
    status: string;
    triggerType: string;
    triggerConfig: Record<string, unknown> | null;
    customPrompt: string | null;
    isActive: boolean;
    nodes: Array<{
        id: string;
        type: string;
        actionType: string | null;
        label: string;
        config: Record<string, unknown> | null;
        positionX: number;
        positionY: number;
    }>;
    edges: Array<{
        id: string;
        sourceNodeId: string;
        targetNodeId: string;
        label: string | null;
    }>;
    runs: Array<{
        id: string;
        status: string;
        triggeredBy: string | null;
        startedAt: string;
        completedAt: string | null;
        error: string | null;
    }>;
}

export function PageClient() {
    const params = useParams<{ workspace: string; id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Define typed nodes and edges
    interface WorkflowNodeData extends Record<string, unknown> {
        label: string;
        nodeType: string;
        actionType: string | null;
        config: Record<string, unknown> | null;
    }

    type WorkflowFlowNode = Node<WorkflowNodeData>;

    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNode, setSelectedNode] = useState<WorkflowFlowNode | null>(
        null
    );
    const [workflowName, setWorkflowName] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch workflow data
    const { data, isLoading, error } = useQuery({
        queryKey: ["workflow", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/workflows/${params.id}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch workflow");
            }
            return res.json() as Promise<{ workflow: WorkflowData }>;
        },
    });

    // Initialize nodes and edges from data
    useEffect(() => {
        if (data?.workflow) {
            const workflow = data.workflow;
            setWorkflowName(workflow.name);
            setCustomPrompt(workflow.customPrompt ?? "");

            // Convert DB nodes to ReactFlow nodes
            const flowNodes: WorkflowFlowNode[] = workflow.nodes.map((node) => ({
                id: node.id,
                type: "workflow",
                position: { x: node.positionX, y: node.positionY },
                data: {
                    label: node.label,
                    nodeType: node.type,
                    actionType: node.actionType,
                    config: node.config,
                },
            }));

            // Convert DB edges to ReactFlow edges
            const flowEdges: Edge[] = workflow.edges.map((edge) => ({
                id: edge.id,
                source: edge.sourceNodeId,
                target: edge.targetNodeId,
                type: "animated",
                markerEnd: { type: MarkerType.ArrowClosed },
                label: edge.label ?? undefined,
            }));

            setNodes(flowNodes);
            setEdges(flowEdges);
        }
    }, [data, setNodes, setEdges]);

    // Track changes
    useEffect(() => {
        if (data?.workflow) {
            const originalNodesCount = data.workflow.nodes.length;
            const originalEdgesCount = data.workflow.edges.length;
            const originalName = data.workflow.name;
            const originalPrompt = data.workflow.customPrompt ?? "";

            if (
                nodes.length !== originalNodesCount ||
                edges.length !== originalEdgesCount ||
                workflowName !== originalName ||
                customPrompt !== originalPrompt
            ) {
                setHasChanges(true);
            }
        }
    }, [nodes, edges, workflowName, customPrompt, data]);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) =>
                addEdge(
                    {
                        ...connection,
                        type: "animated",
                        markerEnd: { type: MarkerType.ArrowClosed },
                    },
                    eds
                )
            );
            setHasChanges(true);
        },
        [setEdges]
    );

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: WorkflowFlowNode) => {
            setSelectedNode(node);
            setIsSidebarOpen(true);
        },
        []
    );

    const addNode = useCallback(
        (template: (typeof nodeTemplates)[0]["items"][0]) => {
            const newNode: WorkflowFlowNode = {
                id: `temp-${Date.now()}`,
                type: "workflow",
                position: { x: 250, y: nodes.length * 100 + 50 },
                data: {
                    label: template.label,
                    nodeType: template.type,
                    actionType: template.actionType,
                    config: {},
                },
            };
            setNodes((nds) => [...nds, newNode]);
            setHasChanges(true);
        },
        [nodes.length, setNodes]
    );

    const deleteNode = useCallback(
        (nodeId: string) => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) =>
                eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
            );
            setSelectedNode(null);
            setIsSidebarOpen(false);
            setHasChanges(true);
        },
        [setNodes, setEdges]
    );

    const updateNodeConfig = useCallback(
        (nodeId: string, config: Record<string, unknown>) => {
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === nodeId
                        ? {
                            ...n,
                            data: { ...n.data, config: { ...n.data.config, ...config } },
                        }
                        : n
                )
            );
            setHasChanges(true);
        },
        [setNodes]
    );

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                name: workflowName,
                customPrompt: customPrompt || null,
                nodes: nodes.map((n) => ({
                    id: n.id,
                    type: n.data.nodeType,
                    actionType: n.data.actionType,
                    label: n.data.label,
                    config: n.data.config,
                    positionX: n.position.x,
                    positionY: n.position.y,
                })),
                edges: edges.map((e) => ({
                    id: e.id,
                    sourceNodeId: e.source,
                    targetNodeId: e.target,
                    label: e.label ?? null,
                })),
            };

            const res = await fetch(`/api/workflows/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save workflow");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflow", params.id] });
            setHasChanges(false);
            toast.success("Workflow saved");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Execute mutation
    const executeMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/workflows/${params.id}/execute`, {
                method: "POST",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to execute workflow");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflow", params.id] });
            toast.success("Workflow execution started");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-[600px] w-[800px]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-destructive">{error.message}</p>
                <Button asChild variant="outline">
                    <Link href={`/${params.workspace}/workflows`}>
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Workflows
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b bg-background px-4 py-3">
                <div className="flex items-center gap-4">
                    <Button asChild size="sm" variant="ghost">
                        <Link href={`/${params.workspace}/workflows`}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <Input
                        className="w-64 font-semibold"
                        onChange={(e) => {
                            setWorkflowName(e.target.value);
                            setHasChanges(true);
                        }}
                        value={workflowName}
                    />
                    {hasChanges && (
                        <Badge className="text-amber-600" variant="outline">
                            Unsaved changes
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        disabled={saveMutation.isPending}
                        onClick={() => saveMutation.mutate()}
                        size="sm"
                        variant="outline"
                    >
                        <FloppyDiskIcon className="mr-2 h-4 w-4" />
                        {saveMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                        disabled={executeMutation.isPending || nodes.length === 0}
                        onClick={() => executeMutation.mutate()}
                        size="sm"
                    >
                        <PlayIcon className="mr-2 h-4 w-4" />
                        {executeMutation.isPending ? "Running..." : "Run"}
                    </Button>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Node Palette */}
                <div className="w-64 border-r bg-muted/30 p-4">
                    <h3 className="mb-4 font-semibold text-sm">Add Nodes</h3>
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        {nodeTemplates.map((category) => (
                            <div className="mb-4" key={category.category}>
                                <p className="mb-2 text-muted-foreground text-xs uppercase">
                                    {category.category}
                                </p>
                                <div className="space-y-1">
                                    {category.items.map((item) => (
                                        <button
                                            className="flex w-full items-center gap-2 rounded-lg border bg-background p-2 text-left text-sm transition-colors hover:bg-accent"
                                            key={item.actionType}
                                            onClick={() => addNode(item)}
                                            type="button"
                                        >
                                            <item.icon className="h-4 w-4 text-muted-foreground" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Custom Prompt Section */}
                        <div className="mt-6 border-t pt-4">
                            <Label className="text-muted-foreground text-xs uppercase">
                                Custom Prompt
                            </Label>
                            <Textarea
                                className="mt-2"
                                onChange={(e) => {
                                    setCustomPrompt(e.target.value);
                                    setHasChanges(true);
                                }}
                                placeholder="Guide the AI with custom instructions..."
                                rows={4}
                                value={customPrompt}
                            />
                            <p className="mt-1 text-muted-foreground text-xs">
                                This prompt influences all AI actions in this workflow.
                            </p>
                        </div>
                    </ScrollArea>
                </div>

                {/* Canvas */}
                <div className="flex-1">
                    <ReactFlow
                        edges={edges}
                        edgeTypes={edgeTypes}
                        fitView
                        nodes={nodes}
                        nodeTypes={nodeTypes}
                        onConnect={onConnect}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onNodesChange={onNodesChange}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>
            </div>

            {/* Node Config Sidebar */}
            <Sheet onOpenChange={setIsSidebarOpen} open={isSidebarOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                            {selectedNode?.data?.label ?? "Node Settings"}
                        </SheetTitle>
                        <SheetDescription>
                            Configure this {selectedNode?.data?.nodeType ?? "node"} node
                        </SheetDescription>
                    </SheetHeader>
                    {selectedNode && (
                        <div className="mt-6 space-y-4">
                            <div>
                                <Label>Label</Label>
                                <Input
                                    className="mt-1"
                                    onChange={(e) => {
                                        setNodes((nds) =>
                                            nds.map((n) =>
                                                n.id === selectedNode.id
                                                    ? { ...n, data: { ...n.data, label: e.target.value } }
                                                    : n
                                            )
                                        );
                                        setHasChanges(true);
                                    }}
                                    value={selectedNode.data?.label ?? ""}
                                />
                            </div>

                            {/* Action-specific config */}
                            {selectedNode.data?.actionType === "generate_topic" && (
                                <>
                                    <div>
                                        <Label>Niche</Label>
                                        <Input
                                            className="mt-1"
                                            onChange={(e) =>
                                                updateNodeConfig(selectedNode.id, {
                                                    niche: e.target.value,
                                                })
                                            }
                                            placeholder="e.g., Web Development"
                                            value={(selectedNode.data?.config?.niche as string) ?? ""}
                                        />
                                    </div>
                                    <div>
                                        <Label>Number of Topics</Label>
                                        <Select
                                            onValueChange={(v) =>
                                                updateNodeConfig(selectedNode.id, {
                                                    count: Number.parseInt(v, 10),
                                                })
                                            }
                                            value={String(selectedNode.data?.config?.count ?? 5)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 3, 5, 10].map((n) => (
                                                    <SelectItem key={n} value={String(n)}>
                                                        {n} topics
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {selectedNode.data?.actionType === "generate_content" && (
                                <>
                                    <div>
                                        <Label>Word Count</Label>
                                        <Select
                                            onValueChange={(v) =>
                                                updateNodeConfig(selectedNode.id, {
                                                    wordCount: Number.parseInt(v, 10),
                                                })
                                            }
                                            value={String(
                                                selectedNode.data?.config?.wordCount ?? 1200
                                            )}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="800">Short (~800 words)</SelectItem>
                                                <SelectItem value="1200">
                                                    Medium (~1200 words)
                                                </SelectItem>
                                                <SelectItem value="2000">Long (~2000 words)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Tone</Label>
                                        <Select
                                            onValueChange={(v) =>
                                                updateNodeConfig(selectedNode.id, { tone: v })
                                            }
                                            value={
                                                (selectedNode.data?.config?.tone as string) ??
                                                "professional"
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="professional">
                                                    Professional
                                                </SelectItem>
                                                <SelectItem value="casual">Casual</SelectItem>
                                                <SelectItem value="formal">Formal</SelectItem>
                                                <SelectItem value="educational">Educational</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {selectedNode.data?.actionType === "generate_tags" && (
                                <div>
                                    <Label>Number of Tags</Label>
                                    <Select
                                        onValueChange={(v) =>
                                            updateNodeConfig(selectedNode.id, {
                                                count: Number.parseInt(v, 10),
                                            })
                                        }
                                        value={String(selectedNode.data?.config?.count ?? 4)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[2, 3, 4, 5, 6].map((n) => (
                                                <SelectItem key={n} value={String(n)}>
                                                    {n} tags
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {selectedNode.data?.actionType === "create_post" && (
                                <div>
                                    <Label>Post Status</Label>
                                    <Select
                                        onValueChange={(v) =>
                                            updateNodeConfig(selectedNode.id, { status: v })
                                        }
                                        value={
                                            (selectedNode.data?.config?.status as string) ?? "draft"
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Save as Draft</SelectItem>
                                            <SelectItem value="published">
                                                Publish Immediately
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    className="w-full"
                                    onClick={() => deleteNode(selectedNode.id)}
                                    variant="destructive"
                                >
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete Node
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default PageClient;
