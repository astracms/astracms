"use client";

import { Input } from "@astra/ui/components/input";
import { Label } from "@astra/ui/components/label";
import { Textarea } from "@astra/ui/components/textarea";
import { UsersIcon } from "@phosphor-icons/react";
import type { OnboardingData } from "./onboarding-wizard";

interface StepAudienceProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function StepAudience({ data, updateData }: StepAudienceProps) {
  const handleDemographicsChange = (demographics: string) => {
    updateData({
      targetAudience: {
        ...data.targetAudience,
        demographics,
      },
    });
  };

  const handleInterestsChange = (interests: string) => {
    const interestsArray = interests
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    updateData({
      targetAudience: {
        ...data.targetAudience,
        interests: interestsArray,
      },
    });
  };

  const handlePainPointsChange = (painPoints: string) => {
    const painPointsArray = painPoints
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    updateData({
      targetAudience: {
        ...data.targetAudience,
        painPoints: painPointsArray,
      },
    });
  };

  const handleGoalsChange = (goals: string) => {
    const goalsArray = goals
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
    updateData({
      targetAudience: {
        ...data.targetAudience,
        goals: goalsArray,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">
          Tell us about your audience
        </h2>
        <p className="mt-2 text-muted-foreground">
          Understanding your audience helps us create content that resonates and
          converts.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border p-4">
          <UsersIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">Target Audience Details</h3>
            <p className="text-muted-foreground text-sm">
              Help us understand who you're trying to reach
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demographics">
              Demographics (age, location, job title, etc.)
            </Label>
            <Input
              id="demographics"
              onChange={(e) => handleDemographicsChange(e.target.value)}
              placeholder="e.g., 25-45 year old small business owners in the US"
              value={data.targetAudience?.demographics || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">
              Interests and hobbies (comma-separated)
            </Label>
            <Input
              id="interests"
              onChange={(e) => handleInterestsChange(e.target.value)}
              placeholder="e.g., technology, entrepreneurship, marketing, productivity"
              value={data.targetAudience?.interests?.join(", ") || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pain-points">
              Pain points and challenges (comma-separated)
            </Label>
            <Textarea
              id="pain-points"
              onChange={(e) => handlePainPointsChange(e.target.value)}
              placeholder="e.g., time management, scaling business, finding customers, staying competitive"
              rows={3}
              value={data.targetAudience?.painPoints?.join(", ") || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">
              Goals and aspirations (comma-separated)
            </Label>
            <Textarea
              id="goals"
              onChange={(e) => handleGoalsChange(e.target.value)}
              placeholder="e.g., grow revenue, build brand awareness, improve efficiency, expand market reach"
              rows={3}
              value={data.targetAudience?.goals?.join(", ") || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
