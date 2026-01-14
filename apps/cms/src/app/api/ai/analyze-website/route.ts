import { db } from "@astra/db";
import { tavily } from "@tavily/core";
import { NextResponse } from "next/server";
import { consumeAICredits, getAICreditStats } from "@/lib/ai-credits";
import { getServerSession } from "@/lib/auth/session";
import {
  type WebsiteAnalysisResult,
  websiteAnalysisRequestSchema,
} from "@/lib/validations/ai-knowledge-base";
import { generateWithAI } from "@/mastra/lib/ai-generator";

const WEBSITE_ANALYSIS_CREDIT_COST = 10;

export async function POST(req: Request) {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check AI credits
  const creditStats = await getAICreditStats(workspaceId);
  if (!creditStats.canUseAI) {
    return NextResponse.json(
      { error: "AI credits exhausted or AI not available on your plan" },
      { status: 403 }
    );
  }

  const json = await req.json();
  const body = websiteAnalysisRequestSchema.safeParse(json);

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: body.error.issues },
      { status: 400 }
    );
  }

  const { url } = body.data;

  // Check Tavily API key
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Website analysis is not configured" },
      { status: 503 }
    );
  }

  try {
    // Use Tavily to search for information about the website
    const client = tavily({ apiKey });
    const searchResults = await client.search(`site:${url} about company`, {
      maxResults: 5,
      includeAnswer: true,
    });

    // Also search for the website directly
    const siteSearch = await client.search(url, {
      maxResults: 3,
      includeAnswer: true,
    });

    // Combine the content
    const combinedContent = [
      ...(searchResults.results || []).map(
        (r: { content: string }) => r.content
      ),
      ...(siteSearch.results || []).map((r: { content: string }) => r.content),
      searchResults.answer || "",
      siteSearch.answer || "",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!combinedContent.trim()) {
      return NextResponse.json(
        {
          error: "Could not find enough information about this website",
          suggestion: "Please fill in the details manually",
        },
        { status: 422 }
      );
    }

    // Use AI to analyze the content and extract structured information
    const analysisPrompt = `Analyze the following website content and extract structured information for a blog content strategy.

Website URL: ${url}

Content found:
${combinedContent}

Please provide a JSON response with the following structure (use null for fields you cannot determine):
{
  "industry": "The primary industry/sector (e.g., Technology, Healthcare, Finance, E-commerce, Education)",
  "niche": "The specific niche within the industry (e.g., SaaS, Digital Marketing, Fitness Tech)",
  "targetAudience": {
    "demographics": "Description of the target audience demographics",
    "interests": ["interest1", "interest2", "interest3"],
    "painPoints": ["pain point 1", "pain point 2"],
    "goals": ["goal 1", "goal 2"]
  },
  "brandVoice": "Description of the brand's communication style and tone",
  "contentThemes": ["theme1", "theme2", "theme3", "theme4"],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Important:
- Be specific and accurate based on the content
- For suggestedKeywords, focus on SEO-relevant terms that would help this business rank
- For contentThemes, suggest blog topic categories that would resonate with their audience
- Respond ONLY with the JSON object, no additional text`;

    const analysisResult = await generateWithAI(
      analysisPrompt,
      workspaceId,
      "website-analysis",
      WEBSITE_ANALYSIS_CREDIT_COST
    );

    // Parse the AI response
    let parsedResult: WebsiteAnalysisResult;
    try {
      // Remove markdown code blocks if present
      const cleanedResult = analysisResult
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResult = JSON.parse(cleanedResult);
    } catch {
      // If parsing fails, return a structured error
      return NextResponse.json(
        {
          error: "Failed to parse analysis results",
          rawResult: analysisResult,
        },
        { status: 500 }
      );
    }

    // Store the analysis in the knowledge base
    await db.aiKnowledgeBase.upsert({
      where: { workspaceId },
      update: {
        websiteUrl: url,
        websiteAnalysis: parsedResult,
        // Optionally pre-fill some fields from analysis
        industry: parsedResult.industry,
        niche: parsedResult.niche,
        targetAudience: parsedResult.targetAudience,
        brandVoice: parsedResult.brandVoice,
        targetKeywords: parsedResult.suggestedKeywords || [],
      },
      create: {
        workspaceId,
        websiteUrl: url,
        websiteAnalysis: parsedResult,
        industry: parsedResult.industry,
        niche: parsedResult.niche,
        targetAudience: parsedResult.targetAudience,
        brandVoice: parsedResult.brandVoice,
        targetKeywords: parsedResult.suggestedKeywords || [],
      },
    });

    return NextResponse.json({
      success: true,
      analysis: parsedResult,
      message: "Website analyzed successfully",
    });
  } catch (error) {
    console.error("[Website Analysis] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze website",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
