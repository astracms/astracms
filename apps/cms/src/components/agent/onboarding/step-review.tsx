"use client";

import { Badge } from "@astra/ui/components/badge";
import {
  BuildingIcon,
  CheckCircleIcon,
  GlobeIcon,
  HashIcon,
  PaletteIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import type { OnboardingData } from "./onboarding-wizard";

interface StepReviewProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function StepReview({ data, updateData }: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">Review your setup</h2>
        <p className="mt-2 text-muted-foreground">
          Here's what we've configured for your personalized AI assistant.
        </p>
      </div>

      <div className="space-y-4">
        {/* Website */}
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <GlobeIcon className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-medium">Website</h3>
            <p className="text-muted-foreground text-sm">
              {data.websiteUrl || "Not provided"}
            </p>
            {data.websiteAnalysis && (
              <div className="mt-2 text-muted-foreground text-xs">
                <p>
                  Industry: {data.websiteAnalysis.industry || "Not detected"}
                </p>
                <p>Niche: {data.websiteAnalysis.niche || "Not detected"}</p>
              </div>
            )}
          </div>
          {data.websiteUrl && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" weight="fill" />
          )}
        </div>

        {/* Industry */}
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <BuildingIcon className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-medium">Industry</h3>
            <p className="text-muted-foreground text-sm">
              {data.industry || "Not specified"}
              {data.niche && ` - ${data.niche}`}
            </p>
          </div>
          {data.industry && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" weight="fill" />
          )}
        </div>

        {/* Audience */}
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <UsersIcon className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-medium">Target Audience</h3>
            <div className="space-y-1 text-muted-foreground text-sm">
              {data.targetAudience?.demographics && (
                <p>
                  <strong>Demographics:</strong>{" "}
                  {data.targetAudience.demographics}
                </p>
              )}
              {data.targetAudience?.interests &&
                data.targetAudience.interests.length > 0 && (
                  <p>
                    <strong>Interests:</strong>{" "}
                    {data.targetAudience.interests.join(", ")}
                  </p>
                )}
              {data.targetAudience?.painPoints &&
                data.targetAudience.painPoints.length > 0 && (
                  <p>
                    <strong>Pain Points:</strong>{" "}
                    {data.targetAudience.painPoints.join(", ")}
                  </p>
                )}
              {data.targetAudience?.goals &&
                data.targetAudience.goals.length > 0 && (
                  <p>
                    <strong>Goals:</strong>{" "}
                    {data.targetAudience.goals.join(", ")}
                  </p>
                )}
              {!data.targetAudience?.demographics &&
                (!data.targetAudience?.interests ||
                  data.targetAudience.interests.length === 0) &&
                (!data.targetAudience?.painPoints ||
                  data.targetAudience.painPoints.length === 0) &&
                (!data.targetAudience?.goals ||
                  data.targetAudience.goals.length === 0) && (
                  <p>Not specified</p>
                )}
            </div>
          </div>
          {(data.targetAudience?.demographics ||
            (data.targetAudience?.interests &&
              data.targetAudience.interests.length > 0) ||
            (data.targetAudience?.painPoints &&
              data.targetAudience.painPoints.length > 0) ||
            (data.targetAudience?.goals &&
              data.targetAudience.goals.length > 0)) && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" weight="fill" />
          )}
        </div>

        {/* Keywords */}
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <HashIcon className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-medium">Target Keywords</h3>
            {data.targetKeywords && data.targetKeywords.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {data.targetKeywords.map((keyword) => (
                  <Badge className="text-xs" key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Not specified</p>
            )}
          </div>
          {data.targetKeywords && data.targetKeywords.length > 0 && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" weight="fill" />
          )}
        </div>

        {/* Tone */}
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <PaletteIcon className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-medium">Writing Style</h3>
            <div className="space-y-1 text-muted-foreground text-sm">
              {data.writingTone && (
                <p>
                  <strong>Tone:</strong>{" "}
                  {data.writingTone.charAt(0).toUpperCase() +
                    data.writingTone.slice(1)}
                </p>
              )}
              {data.brandVoice && (
                <p>
                  <strong>Brand Voice:</strong> {data.brandVoice}
                </p>
              )}
              {!data.writingTone && !data.brandVoice && <p>Not specified</p>}
            </div>
          </div>
          {(data.writingTone || data.brandVoice) && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" weight="fill" />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-primary/5 p-4">
        <h3 className="mb-2 font-medium">Ready to get started!</h3>
        <p className="text-muted-foreground text-sm">
          Your AI assistant is now configured with your preferences. You can
          create personalized, SEO-optimized blog posts that match your brand
          voice and target your ideal audience.
        </p>
      </div>
    </div>
  );
}
