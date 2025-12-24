import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { aiKnowledgeBaseSchema } from "@/lib/validations/ai-knowledge-base";

export async function GET() {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const knowledgeBase = await db.aiKnowledgeBase.findUnique({
    where: { workspaceId },
  });

  if (!knowledgeBase) {
    return NextResponse.json({
      exists: false,
      onboardingCompleted: false,
      onboardingStep: 0,
    });
  }

  return NextResponse.json({
    exists: true,
    ...knowledgeBase,
  });
}

export async function POST(req: Request) {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const body = aiKnowledgeBaseSchema.safeParse(json);

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: body.error.issues },
      { status: 400 }
    );
  }

  const existingKnowledgeBase = await db.aiKnowledgeBase.findUnique({
    where: { workspaceId },
  });

  if (existingKnowledgeBase) {
    return NextResponse.json(
      { error: "Knowledge base already exists. Use PATCH to update." },
      { status: 409 }
    );
  }

  const knowledgeBase = await db.aiKnowledgeBase.create({
    data: {
      workspaceId,
      ...(body.data.websiteUrl !== undefined && {
        websiteUrl: body.data.websiteUrl,
      }),
      ...(body.data.websiteAnalysis !== undefined && {
        websiteAnalysis: body.data.websiteAnalysis,
      }),
      ...(body.data.industry !== undefined && { industry: body.data.industry }),
      ...(body.data.niche !== undefined && { niche: body.data.niche }),
      ...(body.data.targetAudience !== undefined &&
        body.data.targetAudience !== null && {
          targetAudience: body.data.targetAudience,
        }),
      ...(body.data.writingTone !== undefined && {
        writingTone: body.data.writingTone,
      }),
      ...(body.data.brandVoice !== undefined && {
        brandVoice: body.data.brandVoice,
      }),
      ...(body.data.contentGuidelines !== undefined && {
        contentGuidelines: body.data.contentGuidelines,
      }),
      targetKeywords: body.data.targetKeywords ?? [],
      ...(body.data.keywordThemes !== undefined &&
        body.data.keywordThemes !== null && {
          keywordThemes: body.data.keywordThemes,
        }),
      ...(body.data.competitors !== undefined &&
        body.data.competitors !== null && {
          competitors: body.data.competitors,
        }),
      ...(body.data.customFields !== undefined &&
        body.data.customFields !== null && {
          customFields: body.data.customFields,
        }),
      onboardingCompleted: body.data.onboardingCompleted ?? false,
      onboardingStep: body.data.onboardingStep ?? 0,
    },
  });

  return NextResponse.json(knowledgeBase, { status: 201 });
}

export async function PATCH(req: Request) {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const body = aiKnowledgeBaseSchema.partial().safeParse(json);

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: body.error.issues },
      { status: 400 }
    );
  }

  const knowledgeBase = await db.aiKnowledgeBase.upsert({
    where: { workspaceId },
    update: {
      ...(body.data.websiteUrl !== undefined && {
        websiteUrl: body.data.websiteUrl,
      }),
      ...(body.data.websiteAnalysis !== undefined && {
        websiteAnalysis: body.data.websiteAnalysis,
      }),
      ...(body.data.industry !== undefined && { industry: body.data.industry }),
      ...(body.data.niche !== undefined && { niche: body.data.niche }),
      ...(body.data.targetAudience !== undefined &&
        body.data.targetAudience !== null && {
          targetAudience: body.data.targetAudience,
        }),
      ...(body.data.writingTone !== undefined && {
        writingTone: body.data.writingTone,
      }),
      ...(body.data.brandVoice !== undefined && {
        brandVoice: body.data.brandVoice,
      }),
      ...(body.data.contentGuidelines !== undefined && {
        contentGuidelines: body.data.contentGuidelines,
      }),
      ...(body.data.targetKeywords !== undefined && {
        targetKeywords: body.data.targetKeywords,
      }),
      ...(body.data.keywordThemes !== undefined &&
        body.data.keywordThemes !== null && {
          keywordThemes: body.data.keywordThemes,
        }),
      ...(body.data.competitors !== undefined &&
        body.data.competitors !== null && {
          competitors: body.data.competitors,
        }),
      ...(body.data.customFields !== undefined &&
        body.data.customFields !== null && {
          customFields: body.data.customFields,
        }),
      ...(body.data.onboardingCompleted !== undefined && {
        onboardingCompleted: body.data.onboardingCompleted,
      }),
      ...(body.data.onboardingStep !== undefined && {
        onboardingStep: body.data.onboardingStep,
      }),
    },
    create: {
      workspaceId,
      ...(body.data.websiteUrl !== undefined && {
        websiteUrl: body.data.websiteUrl,
      }),
      ...(body.data.websiteAnalysis !== undefined && {
        websiteAnalysis: body.data.websiteAnalysis,
      }),
      ...(body.data.industry !== undefined && { industry: body.data.industry }),
      ...(body.data.niche !== undefined && { niche: body.data.niche }),
      ...(body.data.targetAudience !== undefined &&
        body.data.targetAudience !== null && {
          targetAudience: body.data.targetAudience,
        }),
      ...(body.data.writingTone !== undefined && {
        writingTone: body.data.writingTone,
      }),
      ...(body.data.brandVoice !== undefined && {
        brandVoice: body.data.brandVoice,
      }),
      ...(body.data.contentGuidelines !== undefined && {
        contentGuidelines: body.data.contentGuidelines,
      }),
      targetKeywords: body.data.targetKeywords ?? [],
      ...(body.data.keywordThemes !== undefined &&
        body.data.keywordThemes !== null && {
          keywordThemes: body.data.keywordThemes,
        }),
      ...(body.data.competitors !== undefined &&
        body.data.competitors !== null && {
          competitors: body.data.competitors,
        }),
      ...(body.data.customFields !== undefined &&
        body.data.customFields !== null && {
          customFields: body.data.customFields,
        }),
      onboardingCompleted: body.data.onboardingCompleted ?? false,
      onboardingStep: body.data.onboardingStep ?? 0,
    },
  });

  return NextResponse.json(knowledgeBase);
}
