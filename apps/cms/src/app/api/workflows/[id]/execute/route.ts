import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { getAICreditStats } from "@/lib/ai-credits";
import { getServerSession } from "@/lib/auth/session";
import { getWorkspacePlan, hasAIAccess } from "@/lib/plans";
import { executeWorkflow } from "@/lib/workflow-engine";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST: Execute a workflow manually
export async function POST(
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

    // Check AI credit availability
    const creditStats = await getAICreditStats(workspaceId);

    if (!creditStats.canUseAI) {
        return NextResponse.json(
            {
                error: `Insufficient AI credits. You have used ${creditStats.used} of ${creditStats.limit} credits.`,
                creditsExhausted: true,
            },
            { status: 403 }
        );
    }

    // Get workflow with nodes and edges
    const workflow = await db.aiWorkflow.findFirst({
        where: { id, workspaceId },
        include: {
            nodes: { orderBy: { createdAt: "asc" } },
            edges: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!workflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (workflow.nodes.length === 0) {
        return NextResponse.json(
            { error: "Workflow has no nodes. Add nodes before executing." },
            { status: 400 }
        );
    }

    try {
        // Create a run record
        const run = await db.aiWorkflowRun.create({
            data: {
                workflowId: id,
                status: "running",
                triggeredBy: "manual",
                logs: [],
            },
        });

        // Execute workflow asynchronously
        // Note: In production, this should be queued for background processing
        executeWorkflow(workflow, run.id, workspaceId).catch((error) => {
            console.error("[WORKFLOW EXECUTE] Background execution error:", error);
        });

        // Update lastRunAt
        await db.aiWorkflow.update({
            where: { id },
            data: { lastRunAt: new Date() },
        });

        return NextResponse.json({
            success: true,
            runId: run.id,
            message: "Workflow execution started",
        });
    } catch (error) {
        console.error("[WORKFLOW EXECUTE] Error:", error);
        return NextResponse.json(
            { error: "Failed to execute workflow" },
            { status: 500 }
        );
    }
}
