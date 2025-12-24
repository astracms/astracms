"use client";

import {
  GlobeIcon,
  MagicWandIcon,
  RocketLaunchIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import type { OnboardingData } from "./onboarding-wizard";

interface StepWelcomeProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function StepWelcome({ data, updateData }: StepWelcomeProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <RocketLaunchIcon className="h-8 w-8 text-primary" weight="duotone" />
      </div>

      <div>
        <h2 className="font-bold text-2xl tracking-tight">
          Welcome to Astra AI
        </h2>
        <p className="mt-2 text-muted-foreground">
          Let's personalize your AI assistant for better, more relevant blog
          content.
        </p>
      </div>

      <div className="grid gap-4 pt-4 text-left">
        <div className="flex items-center justify-start gap-3 rounded-lg border p-4">
          <GlobeIcon
            className="h-6 w-6 shrink-0 text-primary"
            weight="duotone"
          />
          <div>
            <h3 className="font-medium">Website Analysis</h3>
            <p className="text-muted-foreground text-sm">
              We'll analyze your website to understand your brand and audience.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-start gap-3 rounded-lg border p-4">
          <TargetIcon
            className="h-6 w-6 shrink-0 text-primary"
            weight="duotone"
          />
          <div>
            <h3 className="font-medium">Target Keywords</h3>
            <p className="text-muted-foreground text-sm">
              Define keywords to optimize your content for search engines.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-start gap-3 rounded-lg border p-4">
          <MagicWandIcon
            className="h-6 w-6 shrink-0 text-primary"
            weight="duotone"
          />
          <div>
            <h3 className="font-medium">Personalized Content</h3>
            <p className="text-muted-foreground text-sm">
              Get blog posts tailored to your industry, audience, and brand
              voice.
            </p>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        This setup takes about 2-3 minutes. You can update these settings
        anytime.
      </p>
    </div>
  );
}
