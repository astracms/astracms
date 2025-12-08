import { toAISdkFormat } from "@mastra/ai-sdk";
import { convertMessages } from "@mastra/core/agent";
import { createUIMessageStreamResponse } from "ai";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { createCMSAgent } from "@/mastra";

export async function POST(req: Request) {
  const sessionData = await getServerSession();

  if (!sessionData?.session.activeOrganizationId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { messages } = await req.json();

  // Create agent with user context
  console.log(
    "[CMS AGENT] Creating agent for workspace:",
    sessionData.session.activeOrganizationId
  );
  console.log("[CMS AGENT] User:", sessionData.user.name, sessionData.user.id);
  console.log("[CMS AGENT] Messages count:", messages.length);

  const cmsAgent = createCMSAgent({
    workspaceId: sessionData.session.activeOrganizationId,
    userId: sessionData.user.id,
    userName: sessionData.user.name ?? "User",
  });

  console.log("[CMS AGENT] Agent created successfully");
  console.log("[CMS AGENT] Starting stream...");

  const stream = await cmsAgent.stream(messages, {
    memory: {
      thread: `${sessionData.session.activeOrganizationId}-${sessionData.user.id}`,
      resource: "cms-chat",
    },
    onStepFinish: (step) => {
      console.log("[CMS AGENT] Step finished:", {
        stepType: step.stepType,
        toolCalls: step.toolCalls?.map((tc) => ({
          name: "payload" in tc ? tc.payload?.toolName : "unknown",
          args: "payload" in tc ? tc.payload?.args : undefined,
        })),
        text: step.text?.slice(0, 200),
      });
    },
  });

  console.log("[CMS AGENT] Stream created, returning response");

  return createUIMessageStreamResponse({
    stream: toAISdkFormat(stream, { from: "agent" }),
  });
}

export async function GET(): Promise<NextResponse> {
  const sessionData = await getServerSession();

  if (!sessionData?.session.activeOrganizationId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Create agent to access memory
  const cmsAgent = createCMSAgent({
    workspaceId: sessionData.session.activeOrganizationId,
    userId: sessionData.user.id,
    userName: sessionData.user.name ?? "User",
  });

  const memory = await cmsAgent.getMemory();
  const response = await memory?.query({
    threadId: `${sessionData.session.activeOrganizationId}-${sessionData.user.id}`,
    resourceId: "cms-chat",
  });

  const uiMessages = convertMessages(response?.uiMessages ?? []).to("AIV5.UI");
  return NextResponse.json(uiMessages);
}
