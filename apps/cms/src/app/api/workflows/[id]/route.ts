import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { getWorkspacePlan, hasAIAccess } from "@/lib/plans";

// Schema for updating a workflow
const updateWorkflowSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    triggerType: z.enum(["manual", "scheduled", "webhook", "rss_feed"]).optional(),
    triggerConfig: z.record(z.unknown()).optional().nullable(),
    customPrompt: z.string().max(2000).optional().nullable(),
    status: z.enum(["draft", "active", "paused", "archived"]).optional(),
    isActive: z.boolean().optional(),
    nodes: z
        .array(
            z.object({
                id: z.string().optional(),
                type: z.string(),
                actionType: z.string().optional().nullable(),
                label: z.string(),
                config: z.record(z.unknown()).optional().nullable(),
                positionX: z.number(),
                positionY: z.number(),
            })
        )
        .optional(),
    edges: z
        .array(
            z.object({
                id: z.string().optional(),
                sourceNodeId: z.string(),
                targetNodeId: z.string(),
                label: z.string().optional().nullable(),
            })
        )
        .optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get a single workflow with nodes and edges
export async function GET(
    _req: Request,
    { params }: RouteParams
): Promise<NextResponse> {
    const sessionData = await getServerSession();

    if (!sessionData?.session.activeOrganizationId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workspaceId = sessionData.session.activeOrganizationId;
    const { id } = await params;

    // Check if workspace has AI access (Pro plan)
    const workspace = await db.organization.findUnique({
        where: { id: workspaceId },
        include: { subscription: true },
    });

    const plan = getWorkspacePlan(workspace?.subscription);

    if (!hasAIAccess(plan)) {
        return NextResponse.json(
            { error: "AI Workflows are only available on Pro plan." },
            { status: 403 }
        );
    }

    const workflow = await db.aiWorkflow.findFirst({
        where: {
            id,
            workspaceId,
        },
        include: {
            nodes: {
                orderBy: { createdAt: "asc" },
            },
            edges: {
                orderBy: { createdAt: "asc" },
            },
            runs: {
                take: 10,
                orderBy: { startedAt: "desc" },
                select: {
                    id: true,
                    status: true,
                    triggeredBy: true,
                    startedAt: true,
                    completedAt: true,
                    error: true,
                },
            },
        },
    });

    if (!workflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({ workflow });
}

// PUT: Update a workflow (including nodes and edges)
export async function PUT(
    req: Request,
    { params }: RouteParams
): Promise<NextResponse> {
    const sessionData = await getServerSession();

    if (!sessionData?.session.activeOrganizationId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workspaceId = sessionData.session.activeOrganizationId;
    const { id } = await params;

    // Check if workspace has AI access (Pro plan)
    const workspace = await db.organization.findUnique({
        where: { id: workspaceId },
        include: { subscription: true },
    });

    const plan = getWorkspacePlan(workspace?.subscription);

    if (!hasAIAccess(plan)) {
        return NextResponse.json(
            { error: "AI Workflows are only available on Pro plan." },
            { status: 403 }
        );
    }

    // Verify workflow exists and belongs to workspace
    const existingWorkflow = await db.aiWorkflow.findFirst({
        where: { id, workspaceId },
    });

    if (!existingWorkflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    try {
        const body = await req.json();
        const validated = updateWorkflowSchema.parse(body);

        // Use transaction for atomic update of workflow + nodes + edges
        const updatedWorkflow = await db.$transaction(async (tx) => {
            // Update workflow fields
            const workflow = await tx.aiWorkflow.update({
                where: { id },
                data: {
                    ...(validated.name !== undefined && { name: validated.name }),
                    ...(validated.description !== undefined && {
                        description: validated.description,
                    }),
                    ...(validated.triggerType !== undefined && {
                        triggerType: validated.triggerType,
                    }),
                    ...(validated.triggerConfig !== undefined && {
                        triggerConfig: validated.triggerConfig === null
                            ? undefined
                            : JSON.parse(JSON.stringify(validated.triggerConfig)),
                    }),
                    ...(validated.customPrompt !== undefined && {
                        customPrompt: validated.customPrompt,
                    }),
                    ...(validated.status !== undefined && { status: validated.status }),
                    ...(validated.isActive !== undefined && {
                        isActive: validated.isActive,
                    }),
                },
            });

            // If nodes are provided, replace all nodes
            if (validated.nodes !== undefined) {
                // Delete existing nodes (edges will cascade delete)
                await tx.aiWorkflowNode.deleteMany({
                    where: { workflowId: id },
                });

                // Create new nodes with temporary IDs mapping
                const nodeIdMap = new Map<string, string>();

                for (const node of validated.nodes) {
                    const createdNode = await tx.aiWorkflowNode.create({
                        data: {
                            workflowId: id,
                            type: node.type,
                            actionType: node.actionType,
                            label: node.label,
                            config: node.config === null || node.config === undefined
                                ? undefined
                                : JSON.parse(JSON.stringify(node.config)),
                            positionX: node.positionX,
                            positionY: node.positionY,
                        },
                    });

                    // Map original ID (or label) to new ID
                    if (node.id) {
                        nodeIdMap.set(node.id, createdNode.id);
                    }
                }

                // Create edges with mapped node IDs
                if (validated.edges) {
                    for (const edge of validated.edges) {
                        const sourceId = nodeIdMap.get(edge.sourceNodeId) ?? edge.sourceNodeId;
                        const targetId = nodeIdMap.get(edge.targetNodeId) ?? edge.targetNodeId;

                        await tx.aiWorkflowEdge.create({
                            data: {
                                workflowId: id,
                                sourceNodeId: sourceId,
                                targetNodeId: targetId,
                                label: edge.label,
                            },
                        });
                    }
                }
            }

            return workflow;
        });

        // Fetch updated workflow with all relations
        const result = await db.aiWorkflow.findUnique({
            where: { id },
            include: {
                nodes: { orderBy: { createdAt: "asc" } },
                edges: { orderBy: { createdAt: "asc" } },
            },
        });

        return NextResponse.json({ workflow: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("[WORKFLOW API] Update error:", error);
        return NextResponse.json(
            { error: "Failed to update workflow" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a workflow
export async function DELETE(
    _req: Request,
    { params }: RouteParams
): Promise<NextResponse> {
    const sessionData = await getServerSession();

    if (!sessionData?.session.activeOrganizationId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workspaceId = sessionData.session.activeOrganizationId;
    const { id } = await params;

    // Verify workflow exists and belongs to workspace
    const existingWorkflow = await db.aiWorkflow.findFirst({
        where: { id, workspaceId },
    });

    if (!existingWorkflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    await db.aiWorkflow.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
