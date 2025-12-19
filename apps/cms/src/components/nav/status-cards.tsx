"use client";

import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { Progress } from "@astra/ui/components/progress";
import { useSidebar } from "@astra/ui/components/sidebar";
import { cn } from "@astra/ui/lib/utils";
import {
  ArrowUpRightIcon,
  CrownIcon,
  FileTextIcon,
  ImagesIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { PLAN_LIMITS, type PlanType } from "@/lib/plans";
import { QUERY_KEYS } from "@/lib/queries/keys";
import { useWorkspace } from "@/providers/workspace";
import type { UsageDashboardData } from "@/types/usage-dashboard";

export function StatusCards() {
  const { state } = useSidebar();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = useWorkspaceId();
  const params = useParams<{ workspace: string }>();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isCollapsed = state === "collapsed";
  const currentPlan = (activeWorkspace?.subscription?.plan ||
    "free") as PlanType;
  const planLimits = PLAN_LIMITS[currentPlan];
  const isFreePlan = currentPlan === "free";
  const isProPlan = currentPlan === "pro";
  const isPremiumPlan = currentPlan === "premium" || currentPlan === "team";

  const { data, refetch: refetchUsage } = useQuery({
    queryKey: workspaceId
      ? QUERY_KEYS.USAGE_DASHBOARD(workspaceId)
      : ["usage-dashboard", "disabled"],
    queryFn: async (): Promise<UsageDashboardData> => {
      const response = await fetch("/api/metrics/usage");
      if (!response.ok) {
        throw new Error("Failed to fetch usage metrics");
      }
      return response.json();
    },
    enabled: Boolean(workspaceId),
    staleTime: 1000 * 60 * 2, // Reduced to 2 minutes
    refetchOnMount: true, // Always refetch on mount
  });

  // Fetch AI credit usage
  const { data: aiCredits, refetch: refetchCredits } = useQuery({
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
    staleTime: 1000 * 60 * 2, // Reduced to 2 minutes
    refetchOnMount: true, // Always refetch on mount
  });

  // Refetch data when workspace changes
  useEffect(() => {
    if (workspaceId) {
      refetchUsage();
      refetchCredits();
    }
  }, [workspaceId, refetchUsage, refetchCredits]);

  if (isCollapsed) {
    return null;
  }

  const mediaCount = data?.media?.total ?? 0;
  const apiUsageTotal = data?.api?.totals?.total ?? 0;
  const teamCount = activeWorkspace?.members?.length ?? 0;
  const aiCreditsUsed = aiCredits?.used ?? 0;

  const usageStats = [
    {
      label: "API Requests",
      used: apiUsageTotal,
      total:
        planLimits.maxApiRequests === -1
          ? Number.POSITIVE_INFINITY
          : planLimits.maxApiRequests,
      color: "bg-blue-500",
      type: "number" as const,
    },
    {
      label: "AI Credits",
      used: aiCreditsUsed,
      total: planLimits.aiCreditsPerMonth,
      color: "bg-purple-500",
      type: "number" as const,
    },
    {
      label: "Media Storage",
      used: mediaCount,
      total: planLimits.maxMediaStorage,
      color: "bg-green-500",
      type: "storage" as const,
    },
    {
      label: "Team Members",
      used: teamCount,
      total: planLimits.maxMembers,
      color: "bg-orange-500",
      type: "number" as const,
    },
  ];

  const formatUsage = (stat: (typeof usageStats)[0]) => {
    if (stat.total === Number.POSITIVE_INFINITY) {
      return `${stat.used.toLocaleString()} / Unlimited`;
    }

    if (stat.type === "storage") {
      // Convert MB to GB (values in plans are in MB)
      const usedGB = (stat.used / 1024).toFixed(2);
      const totalGB = (stat.total / 1024).toFixed(0);
      return `${usedGB} GB / ${totalGB} GB`;
    }

    return `${stat.used.toLocaleString()} / ${stat.total.toLocaleString()}`;
  };

  return (
    <>
      {/* Usage Stats Card */}
      <div className="m-3 space-y-4 rounded-xl border border-sidebar-border bg-card p-4">
        {/* Usage Stats */}
        <div className="space-y-4">
          {usageStats.map((stat) => {
            // Handle edge cases: 0 total, Infinity, or invalid numbers
            let percentage = 0;
            if (stat.total === Number.POSITIVE_INFINITY) {
              percentage = 0;
            } else if (stat.total === 0 || !stat.total) {
              percentage = 0;
            } else {
              percentage = Math.min(100, (stat.used / stat.total) * 100);
            }

            const isNearLimit = percentage >= 85;

            return (
              <div className="space-y-2" key={stat.label}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground text-xs">
                    {stat.label}
                  </span>
                  <span
                    className={cn(
                      "font-semibold text-xs",
                      isNearLimit && "text-destructive"
                    )}
                  >
                    {stat.total === Number.POSITIVE_INFINITY
                      ? "∞"
                      : stat.total === 0
                        ? "N/A"
                        : `${percentage.toFixed(0)}%`}
                  </span>
                </div>
                <Progress className="h-1.5" value={percentage} />
                <p className="text-muted-foreground text-xs">
                  {formatUsage(stat)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA for Free Plan */}
        {isFreePlan && (
          <div className="space-y-3 border-sidebar-border border-t pt-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-card-foreground text-sm">
                Start 7-Day Free Trial
              </h3>
              <p className="text-muted-foreground text-xs">
                Get unlimited access to all features
              </p>
            </div>
            <Button
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowUpgradeModal(true)}
              size="sm"
            >
              <CrownIcon className="h-4 w-4" />
              Start Free Trial
            </Button>
          </div>
        )}

        {/* Upgrade CTA for Pro Plan */}
        {isProPlan && (
          <div className="space-y-3 border-sidebar-border border-t pt-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-card-foreground text-sm">
                Start 7-Day Free Trial
              </h3>
              <p className="text-muted-foreground text-xs">
                Get unlimited API requests and more
              </p>
            </div>
            <Button
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowUpgradeModal(true)}
              size="sm"
            >
              <CrownIcon className="h-4 w-4" />
              Start Free Trial
            </Button>
          </div>
        )}

        {/* Plan Badge for Premium Plans */}
        {isPremiumPlan && (
          <div className="flex items-center justify-between border-sidebar-border border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <SparkleIcon
                  className="h-3.5 w-3.5 text-primary"
                  weight="fill"
                />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground text-xs capitalize">
                  {currentPlan === "premium" ? "Premium" : currentPlan} Plan
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Premium features
                </p>
              </div>
            </div>
            <Badge className="text-[10px]" variant="premium">
              {currentPlan === "premium"
                ? "PREMIUM"
                : currentPlan.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
