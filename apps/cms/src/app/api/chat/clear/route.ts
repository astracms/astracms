import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { createCMSAgent } from "@/mastra";

/**
 * DELETE /api/chat/clear
 * Clears the conversation memory for the current user's thread.
 * Use this when encountering duplicate tool call ID errors.
 */
export async function DELETE() {
  const sessionData = await getServerSession();

  if (!sessionData?.session.activeOrganizationId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const threadId = `${sessionData.session.activeOrganizationId}-${sessionData.user.id}`;
  const resourceId = "cms-chat";

  // Create agent to access memory
  const cmsAgent = createCMSAgent({
    workspaceId: sessionData.session.activeOrganizationId,
    userId: sessionData.user.id,
    userName: sessionData.user.name ?? "User",
  });

  const memory = await cmsAgent.getMemory();

  if (!memory) {
    return NextResponse.json(
      { error: "Memory not available" },
      { status: 500 }
    );
  }

  // Delete the thread with corrupted tool calls
  await memory.createThread({ threadId, resourceId });

  return NextResponse.json({
    success: true,
    message: `Cleared conversation memory for thread: ${threadId}`,
  });
}
