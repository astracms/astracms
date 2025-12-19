import { db } from "@astra/db";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { convertMessages } from "@mastra/core/agent";
import { createUIMessageStreamResponse } from "ai";
import { NextResponse } from "next/server";
import { getAICreditStats } from "@/lib/ai-credits";
import { parseAIError } from "@/lib/ai-error-handler";
import { getServerSession } from "@/lib/auth/session";
import { getWorkspacePlan, hasAIAccess } from "@/lib/plans";
import { aiChatRateLimit, checkRateLimit } from "@/lib/rate-limit";
import { type CMSAgent, createCMSAgent } from "@/mastra";

export async function POST(req: Request) {
  const sessionData = await getServerSession();

  if (!sessionData?.session.activeOrganizationId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Rate limiting - 10 requests per minute per workspace
  const rateLimitCheck = await checkRateLimit(
    sessionData.session.activeOrganizationId,
    aiChatRateLimit
  );
  if (rateLimitCheck) {
    return rateLimitCheck;
  }

  // Check if workspace has AI access
  const workspace = await db.organization.findUnique({
    where: { id: sessionData.session.activeOrganizationId },
    include: { subscription: true },
  });

  const plan = getWorkspacePlan(workspace?.subscription);

  if (!hasAIAccess(plan)) {
    return NextResponse.json(
      {
        error:
          "AI features are not available on your current plan. Please upgrade to access AI capabilities.",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  // Check AI credit availability
  const creditStats = await getAICreditStats(
    sessionData.session.activeOrganizationId
  );

  if (!creditStats.canUseAI) {
    return NextResponse.json(
      {
        error: `You have used all your AI credits for this billing period. You have ${creditStats.used} of ${creditStats.limit} credits used.`,
        upgrade: true,
        creditsExhausted: true,
      },
      { status: 403 }
    );
  }

  const { messages } = await req.json();

  // Create agent with user context and error handling
  console.log(
    "[CMS AGENT] Creating agent for workspace:",
    sessionData.session.activeOrganizationId
  );
  console.log("[CMS AGENT] User:", sessionData.user.name, sessionData.user.id);
  console.log("[CMS AGENT] Messages count:", messages.length);

  let cmsAgent: CMSAgent;
  try {
    cmsAgent = createCMSAgent({
      workspaceId: sessionData.session.activeOrganizationId,
      userId: sessionData.user.id,
      userName: sessionData.user.name ?? "User",
    });
  } catch (error) {
    console.error("[CMS AGENT] Failed to create agent:", error);
    const aiError = parseAIError(error);
    return NextResponse.json(
      {
        error: aiError.userMessage,
        type: aiError.type,
        canRetry: aiError.canRetry,
        requiresUpgrade: aiError.requiresUpgrade,
        details:
          process.env.NODE_ENV === "development" ? aiError.message : undefined,
      },
      { status: 503 }
    );
  }

  console.log("[CMS AGENT] Agent created successfully");
  console.log("[CMS AGENT] Starting stream...");

  try {
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
  } catch (error) {
    console.error("[CMS AGENT] Stream creation failed:", error);
    const aiError = parseAIError(error);
    return NextResponse.json(
      {
        error: aiError.userMessage,
        type: aiError.type,
        canRetry: aiError.canRetry,
        requiresUpgrade: aiError.requiresUpgrade,
        details:
          process.env.NODE_ENV === "development" ? aiError.message : undefined,
      },
      { status: 500 }
    );
  }
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
  if (!memory) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  try {
    const response = await memory.query({
      threadId: `${sessionData.session.activeOrganizationId}-${sessionData.user.id}`,
      resourceId: "cms-chat",
    });

    const uiMessages = convertMessages(response?.uiMessages ?? []).to(
      "AIV5.UI"
    );
    return NextResponse.json(uiMessages);
  } catch (error) {
    // Thread doesn't exist yet - return empty array
    console.log(
      "[CMS AGENT] No existing thread found, returning empty messages"
    );
    return NextResponse.json([]);
  }
}
