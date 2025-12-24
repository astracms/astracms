"use client";

import { Button } from "@astra/ui/components/button";
import { Card, CardContent } from "@astra/ui/components/card";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StepAudience } from "./step-audience";
import { StepIndustry } from "./step-industry";
import { StepKeywords } from "./step-keywords";
import { StepReview } from "./step-review";
import { StepTone } from "./step-tone";
import { StepWebsite } from "./step-website";
import { StepWelcome } from "./step-welcome";

export interface OnboardingData {
  websiteUrl?: string;
  websiteAnalysis?: {
    industry?: string;
    niche?: string;
    targetAudience?: {
      demographics?: string;
      interests?: string[];
      painPoints?: string[];
      goals?: string[];
    };
    brandVoice?: string;
    suggestedKeywords?: string[];
  };
  industry?: string;
  niche?: string;
  targetAudience?: {
    demographics?: string;
    interests?: string[];
    painPoints?: string[];
    goals?: string[];
  };
  writingTone?: string;
  brandVoice?: string;
  targetKeywords?: string[];
}

const STEPS = [
  { id: "welcome", title: "Welcome", component: StepWelcome },
  { id: "website", title: "Website", component: StepWebsite },
  { id: "industry", title: "Industry", component: StepIndustry },
  { id: "audience", title: "Audience", component: StepAudience },
  { id: "keywords", title: "Keywords", component: StepKeywords },
  { id: "tone", title: "Tone", component: StepTone },
  { id: "review", title: "Review", component: StepReview },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const queryClient = useQueryClient();

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const completeMutation = useMutation({
    mutationFn: async () => {
      // Save all data to knowledge base
      const response = await fetch("/api/ai/knowledge-base", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: data.websiteUrl,
          websiteAnalysis: data.websiteAnalysis,
          industry: data.industry,
          niche: data.niche,
          targetAudience: data.targetAudience,
          writingTone: data.writingTone,
          brandVoice: data.brandVoice,
          targetKeywords: data.targetKeywords,
          onboardingCompleted: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save onboarding data");
      }

      // Mark onboarding as complete
      const completeResponse = await fetch("/api/ai/onboarding/complete", {
        method: "POST",
      });

      if (!completeResponse.ok) {
        throw new Error("Failed to complete onboarding");
      }

      return completeResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-knowledge-base"] });
      toast.success(
        "Setup complete! Astra AI is now personalized for your business."
      );
      onComplete();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete setup"
      );
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeMutation.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = STEPS[currentStep]?.component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      {/* Stepper Nav */}
      <div className="mb-8 w-full max-w-3xl">
        <ul className="relative flex flex-row gap-x-2">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isLast = index === STEPS.length - 1;

            return (
              <li
                className={`group flex flex-1 shrink basis-0 items-center gap-x-2 ${
                  isLast ? "grow-0" : ""
                }`}
                key={step.id}
              >
                <span className="inline-flex min-h-7 min-w-7 items-center align-middle text-xs">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full font-medium transition-all duration-200 ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="size-3 shrink-0"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                </span>
                {!isLast && (
                  <div
                    className={`h-px w-full flex-1 transition-colors duration-200 ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Content Card */}
      <Card className="w-full max-w-3xl border-border/50 shadow-xl">
        <CardContent className="p-8">
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
                key={currentStep}
                transition={{ duration: 0.2 }}
              >
                {CurrentStepComponent && (
                  <CurrentStepComponent data={data} updateData={updateData} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Button Group */}
          <div className="mt-8 flex items-center justify-between gap-x-2 border-t pt-6">
            <Button
              className="gap-x-1"
              disabled={currentStep === 0}
              onClick={handleBack}
              variant="outline"
            >
              <svg
                className="size-4 shrink-0"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </Button>
            <Button
              className="gap-x-1"
              disabled={completeMutation.isPending}
              onClick={handleNext}
            >
              {completeMutation.isPending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : isLastStep ? (
                <>
                  Finish
                  <CheckCircleIcon className="size-4" />
                </>
              ) : (
                <>
                  Next
                  <svg
                    className="size-4 shrink-0"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
