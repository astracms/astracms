import { createAgentUIStreamResponse } from "ai";
import { createCMSAgent } from "@/lib/ai/agent";
import { getServerSession } from "@/lib/auth/session";

export const maxDuration = 30;

export async function POST(req: Request) {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  // Create agent instance with session context
  const cmsAgent = createCMSAgent({
    userName: sessionData.user.name,
    workspaceId,
  });
  return createAgentUIStreamResponse({
    agent: cmsAgent,
    messages,
  });
}
