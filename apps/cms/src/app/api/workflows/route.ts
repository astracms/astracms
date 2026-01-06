import { db, type Prisma } from "@astra/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { getWorkspacePlan, hasAIAccess } from "@/lib/plans";

// Schema for creating a new workflow
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  triggerType: z.enum(["manual", "scheduled", "webhook", "rss_feed"]),
  triggerConfig: z.record(z.unknown()).optional(),
  customPrompt: z.string().max(2000).optional(),
});

// GET: List all workflows for the workspace
export async function GET(): Promise<NextResponse> {
  const sessionData = await getServerSession();

  if (!sessionData?.session.activeOrganizationId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const workspaceId = sessionData.session.activeOrganizationId;

  // Check if workspace has AI access (Pro plan)
  const workspace = await db.organization.findUnique({
    where: { id: workspaceId },
    include: { subscription: true },
  });

  const plan = getWorkspacePlan(workspace?.subscription);

  if (!hasAIAccess(plan)) {
    return NextResponse.json(
      {
        error:
          "AI Workflows are only available on Pro plan. Please upgrade to access this feature.",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  const workflows = await db.aiWorkflow.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      triggerType: true,
      isActive: true,
      lastRunAt: true,
      nextRunAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          nodes: true,
          runs: true,
        },
      },
    },
  });

  return NextResponse.json({ workflows });
}

// POST: Create a new workflow
export async function POST(req: Request): Promise<NextResponse> {
  const sessionData = await getServerSession();

  if (!sessionData?.session.activeOrganizationId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const workspaceId = sessionData.session.activeOrganizationId;

  // Check if workspace has AI access (Pro plan)
  const workspace = await db.organization.findUnique({
    where: { id: workspaceId },
    include: { subscription: true },
  });

  const plan = getWorkspacePlan(workspace?.subscription);

  if (!hasAIAccess(plan)) {
    return NextResponse.json(
      {
        error:
          "AI Workflows are only available on Pro plan. Please upgrade to access this feature.",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const validated = createWorkflowSchema.parse(body);

    const workflow = await db.aiWorkflow.create({
      data: {
        name: validated.name,
        description: validated.description,
        triggerType: validated.triggerType,
        triggerConfig: validated.triggerConfig as
          | Prisma.InputJsonValue
          | undefined,
        customPrompt: validated.customPrompt,
        workspaceId,
        status: "draft",
        isActive: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        triggerType: true,
        triggerConfig: true,
        customPrompt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[WORKFLOW API] Create error:", error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
