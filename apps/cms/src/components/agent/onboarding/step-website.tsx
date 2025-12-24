"use client";

import { Button } from "@astra/ui/components/button";
import { Input } from "@astra/ui/components/input";
import { Label } from "@astra/ui/components/label";
import { GlobeIcon, LinkIcon, SparkleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { OnboardingData } from "./onboarding-wizard";

interface StepWebsiteProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function StepWebsite({ data, updateData }: StepWebsiteProps) {
  const [url, setUrl] = useState(data.websiteUrl || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        updateData({
          websiteUrl: url.trim(),
          websiteAnalysis: result.analysis,
          industry: result.analysis.industry,
          niche: result.analysis.niche,
          targetAudience: result.analysis.targetAudience,
          brandVoice: result.analysis.brandVoice,
          targetKeywords: result.analysis.suggestedKeywords,
        });
      } else {
        const error = await response.json();
        console.error("Analysis failed:", error);
        // Still save the URL even if analysis fails
        updateData({ websiteUrl: url.trim() });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      updateData({ websiteUrl: url.trim() });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">
          Tell us about your website
        </h2>
        <p className="mt-2 text-muted-foreground">
          We'll analyze your website to understand your brand and suggest
          personalized content.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="website-url">Website URL</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                id="website-url"
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                value={url}
              />
            </div>
            <Button
              className="shrink-0"
              disabled={!url.trim() || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <SparkleIcon className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparkleIcon className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {data.websiteAnalysis && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <GlobeIcon className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Analysis Results</h3>
            </div>
            <div className="grid gap-3 text-sm">
              {data.websiteAnalysis.industry && (
                <div>
                  <span className="font-medium">Industry:</span>{" "}
                  {data.websiteAnalysis.industry}
                </div>
              )}
              {data.websiteAnalysis.niche && (
                <div>
                  <span className="font-medium">Niche:</span>{" "}
                  {data.websiteAnalysis.niche}
                </div>
              )}
              {data.websiteAnalysis.targetAudience?.demographics && (
                <div>
                  <span className="font-medium">Audience:</span>{" "}
                  {data.websiteAnalysis.targetAudience.demographics}
                </div>
              )}
              {data.websiteAnalysis.suggestedKeywords &&
                data.websiteAnalysis.suggestedKeywords.length > 0 && (
                  <div>
                    <span className="font-medium">Keywords:</span>{" "}
                    {data.websiteAnalysis.suggestedKeywords
                      .slice(0, 3)
                      .join(", ")}
                    {data.websiteAnalysis.suggestedKeywords.length > 3 && "..."}
                  </div>
                )}
            </div>
          </div>
        )}

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">What happens next?</h3>
          <ul className="space-y-1 text-muted-foreground text-sm">
            <li>• We'll analyze your website content and structure</li>
            <li>• Extract industry insights and target audience details</li>
            <li>• Suggest relevant keywords for SEO optimization</li>
            <li>• Use this information to personalize your blog content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
