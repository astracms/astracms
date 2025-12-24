import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";

export async function POST() {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const knowledgeBase = await db.aiKnowledgeBase.upsert({
    where: { workspaceId },
    update: {
      onboardingCompleted: true,
    },
    create: {
      workspaceId,
      onboardingCompleted: true,
    },
  });

  return NextResponse.json({
    success: true,
    onboardingCompleted: knowledgeBase.onboardingCompleted,
  });
}
