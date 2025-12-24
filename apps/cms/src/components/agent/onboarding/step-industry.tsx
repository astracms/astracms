"use client";

import { Input } from "@astra/ui/components/input";
import { Label } from "@astra/ui/components/label";
import {
  AirplaneTakeoffIcon,
  BankIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  CpuIcon,
  DotsThreeIcon,
  FactoryIcon,
  FirstAidKitIcon,
  ForkKnifeIcon,
  HouseLineIcon,
  MegaphoneIcon,
  ShoppingCartIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { OnboardingData } from "./onboarding-wizard";

interface StepIndustryProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

interface IndustryItem {
  name: string;
  icon: ComponentType<{
    className?: string;
    weight?: "duotone" | "fill" | "regular";
  }>;
}

const INDUSTRIES: IndustryItem[] = [
  { name: "Technology", icon: CpuIcon },
  { name: "Healthcare", icon: FirstAidKitIcon },
  { name: "Finance", icon: BankIcon },
  { name: "E-commerce", icon: ShoppingCartIcon },
  { name: "Education", icon: BookOpenIcon },
  { name: "Marketing", icon: MegaphoneIcon },
  { name: "Real Estate", icon: HouseLineIcon },
  { name: "Consulting", icon: BuildingOfficeIcon },
  { name: "Manufacturing", icon: FactoryIcon },
  { name: "Retail", icon: StorefrontIcon },
  { name: "Food & Beverage", icon: ForkKnifeIcon },
  { name: "Travel & Hospitality", icon: AirplaneTakeoffIcon },
  { name: "Other", icon: DotsThreeIcon },
];

export function StepIndustry({ data, updateData }: StepIndustryProps) {
  const handleIndustrySelect = (industry: string) => {
    updateData({ industry });
  };

  const handleNicheChange = (niche: string) => {
    updateData({ niche });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">
          What industry are you in?
        </h2>
        <p className="mt-2 text-muted-foreground">
          This helps us create content that's relevant to your field and
          audience.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="font-medium text-base">Select your industry</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <button
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                    data.industry === industry.name
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border"
                  }`}
                  key={industry.name}
                  onClick={() => handleIndustrySelect(industry.name)}
                  type="button"
                >
                  <Icon className="h-4 w-4 shrink-0" weight="duotone" />
                  <span className="text-sm">{industry.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">Specific niche or specialty (optional)</Label>
          <Input
            id="niche"
            onChange={(e) => handleNicheChange(e.target.value)}
            placeholder="e.g., SaaS, Digital Marketing, Fitness Tech"
            value={data.niche || ""}
          />
          <p className="text-muted-foreground text-xs">
            Be as specific as possible to get more targeted content suggestions.
          </p>
        </div>
      </div>
    </div>
  );
}
