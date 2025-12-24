"use client";

import { Label } from "@astra/ui/components/label";
import { Textarea } from "@astra/ui/components/textarea";
import { PaletteIcon } from "@phosphor-icons/react";
import type { OnboardingData } from "./onboarding-wizard";

interface StepToneProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const TONE_OPTIONS = [
  {
    id: "professional",
    label: "Professional",
    description:
      "Formal, business-like tone suitable for B2B and corporate audiences",
  },
  {
    id: "casual",
    label: "Casual",
    description:
      "Relaxed, conversational tone that feels approachable and friendly",
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Warm and inviting tone that builds rapport with readers",
  },
  {
    id: "authoritative",
    label: "Authoritative",
    description:
      "Confident, expert tone that establishes credibility and trust",
  },
  {
    id: "educational",
    label: "Educational",
    description:
      "Informative and instructive tone focused on teaching and learning",
  },
];

export function StepTone({ data, updateData }: StepToneProps) {
  const handleToneSelect = (tone: string) => {
    updateData({ writingTone: tone });
  };

  const handleBrandVoiceChange = (brandVoice: string) => {
    updateData({ brandVoice });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">
          Writing style and tone
        </h2>
        <p className="mt-2 text-muted-foreground">
          Choose how you want your blog posts to sound and feel.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border p-4">
          <PaletteIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">Content Personality</h3>
            <p className="text-muted-foreground text-sm">
              Define the voice and tone of your blog content
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="font-medium text-base">Writing tone</Label>
            <div className="mt-3 grid gap-3">
              {TONE_OPTIONS.map((tone) => (
                <button
                  className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${
                    data.writingTone === tone.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border"
                  }`}
                  key={tone.id}
                  onClick={() => handleToneSelect(tone.id)}
                  type="button"
                >
                  <span className="font-medium">{tone.label}</span>
                  <span className="text-muted-foreground text-sm">
                    {tone.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-voice">
              Brand voice description (optional)
            </Label>
            <Textarea
              id="brand-voice"
              onChange={(e) => handleBrandVoiceChange(e.target.value)}
              placeholder="Describe your brand's personality, values, or any specific writing guidelines..."
              rows={4}
              value={data.brandVoice || ""}
            />
            <p className="text-muted-foreground text-xs">
              This helps us match your existing brand communication style.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
