import { NextResponse } from "next/server";
import { parseAIError } from "@/lib/ai-error-handler";
import { aiReadabilityBodySchema } from "@/lib/validations/editor";
import { createReadabilityAgent } from "@/mastra";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = aiReadabilityBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { content, metrics } = parsed.data;
    const agent = createReadabilityAgent();

    const prompt = `Analyze this content and provide 3-6 specific, actionable suggestions:

CONTENT:
${content.slice(0, 3000)}

METRICS:
- Word Count: ${metrics.wordCount}
- Sentence Count: ${metrics.sentenceCount}
- Words per Sentence: ${metrics.wordsPerSentence.toFixed(1)}
- Readability Score: ${metrics.readabilityScore.toFixed(1)}
- Reading Time: ${metrics.readingTime} min

Respond with JSON only:
{
  "suggestions": [
    {
      "text": "Main suggestion (1-2 sentences)",
      "explanation": "Brief explanation (optional)",
      "textReference": "Specific text from content (optional)"
    }
  ]
}`;

    const response = await agent.generate([{ role: "user", content: prompt }]);
    const text = typeof response.text === "string" ? response.text : "";

    return new Response(text, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI suggestions error:", error);
    const aiError = parseAIError(error);
    return NextResponse.json(
      {
        error: aiError.userMessage,
        type: aiError.type,
        canRetry: aiError.canRetry,
        requiresUpgrade: aiError.requiresUpgrade,
      },
      { status: 500 }
    );
  }
}
