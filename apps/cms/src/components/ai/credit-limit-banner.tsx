"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@astra/ui/components/alert";
import { Button } from "@astra/ui/components/button";
import { Progress } from "@astra/ui/components/progress";
import { SparkleIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface AICreditStats {
  used: number;
  limit: number;
  remaining: number;
  usagePercentage: number;
  canUseAI: boolean;
}

export function CreditLimitBanner() {
  const [dismissed, setDismissed] = useState(false);
  const workspaceId = useWorkspaceId();
  const params = useParams<{ workspace: string }>();

  const { data: aiCredits } = useQuery<AICreditStats>({
    queryKey: workspaceId
      ? ["ai-credits", workspaceId]
      : ["ai-credits", "disabled"],
    queryFn: async () => {
      const response = await fetch("/api/metrics/ai-credits");
      if (!response.ok) {
        throw new Error("Failed to fetch AI credits");
      }
      return response.json();
    },
    enabled: Boolean(workspaceId),
    staleTime: 1000 * 60 * 5, // Refresh every 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });

  if (dismissed || !aiCredits) {
    return null;
  }

  const percentage = aiCredits.usagePercentage;
  const isExhausted = !aiCredits.canUseAI;
  const isWarning = percentage >= 80 && percentage < 100;

  // Only show if warning or exhausted
  if (!isWarning && !isExhausted) {
    return null;
  }

  return (
    <Alert
      className="relative mb-4"
      variant={isExhausted ? "destructive" : "default"}
    >
      <Button
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
        size="sm"
        variant="ghost"
      >
        <XIcon className="h-4 w-4" />
      </Button>

      <div className="flex items-start gap-3 pr-8">
        {isExhausted ? (
          <WarningIcon className="mt-0.5 h-5 w-5 shrink-0" weight="fill" />
        ) : (
          <SparkleIcon className="mt-0.5 h-5 w-5 shrink-0" weight="fill" />
        )}

        <div className="flex-1 space-y-2">
          <AlertTitle className="font-semibold text-sm">
            {isExhausted ? "AI Credits Exhausted" : "AI Credits Running Low"}
          </AlertTitle>

          <AlertDescription className="text-sm">
            {isExhausted ? (
              <>
                You've used all your AI credits for this billing period (
                {aiCredits.used.toLocaleString()} /{" "}
                {aiCredits.limit.toLocaleString()}). Upgrade to continue using
                AI features.
              </>
            ) : (
              <>
                You've used {aiCredits.used.toLocaleString()} of{" "}
                {aiCredits.limit.toLocaleString()} AI credits (
                {percentage.toFixed(0)}%). Consider upgrading to get more
                credits.
              </>
            )}
          </AlertDescription>

          <div className="space-y-1">
            <Progress className="h-2" value={percentage} />
            <p className="text-muted-foreground text-xs">
              {aiCredits.remaining.toLocaleString()} credits remaining
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              asChild
              size="sm"
              variant={isExhausted ? "default" : "outline"}
            >
              <Link href={`/${params.workspace}/settings/billing`}>
                {isExhausted ? "Upgrade Now" : "View Plans"}
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/${params.workspace}/settings/billing`}>
                View Usage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}
