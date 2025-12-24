import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { onboardingStepSchema } from "@/lib/validations/ai-knowledge-base";

export async function GET() {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const knowledgeBase = await db.aiKnowledgeBase.findUnique({
    where: { workspaceId },
    select: {
      onboardingCompleted: true,
      onboardingStep: true,
    },
  });

  if (!knowledgeBase) {
    return NextResponse.json({
      onboardingCompleted: false,
      onboardingStep: 0,
    });
  }

  return NextResponse.json({
    onboardingCompleted: knowledgeBase.onboardingCompleted,
    onboardingStep: knowledgeBase.onboardingStep,
  });
}

export async function PATCH(req: Request) {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const body = onboardingStepSchema.safeParse(json);

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: body.error.issues },
      { status: 400 }
    );
  }

  const knowledgeBase = await db.aiKnowledgeBase.upsert({
    where: { workspaceId },
    update: {
      onboardingStep: body.data.step,
    },
    create: {
      workspaceId,
      onboardingStep: body.data.step,
    },
  });

  return NextResponse.json({
    onboardingStep: knowledgeBase.onboardingStep,
    onboardingCompleted: knowledgeBase.onboardingCompleted,
  });
}
