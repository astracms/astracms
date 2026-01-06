import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get workflow run history
export async function GET(
    req: Request,
    { params }: RouteParams
): Promise<NextResponse> {
    const sessionData = await getServerSession();

    if (!sessionData?.session.activeOrganizationId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workspaceId = sessionData.session.activeOrganizationId;
    const { id } = await params;

    // Parse query params for pagination
    const url = new URL(req.url);
    const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = Math.min(
        Number.parseInt(url.searchParams.get("limit") ?? "20", 10),
        50
    );
    const skip = (page - 1) * limit;

    // Verify workflow belongs to workspace
    const workflow = await db.aiWorkflow.findFirst({
        where: { id, workspaceId },
        select: { id: true },
    });

    if (!workflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const [runs, total] = await Promise.all([
        db.aiWorkflowRun.findMany({
            where: { workflowId: id },
            orderBy: { startedAt: "desc" },
            skip,
            take: limit,
            select: {
                id: true,
                status: true,
                triggeredBy: true,
                startedAt: true,
                completedAt: true,
                error: true,
                result: true,
            },
        }),
        db.aiWorkflowRun.count({
            where: { workflowId: id },
        }),
    ]);

    return NextResponse.json({
        runs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}
