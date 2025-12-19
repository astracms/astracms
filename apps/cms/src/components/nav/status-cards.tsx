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
  FileTextIcon,
  ImagesIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
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
  const isPro = activeWorkspace?.subscription?.plan === "pro";

  const { data } = useQuery({
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
    staleTime: 1000 * 60 * 10,
  });

  if (isCollapsed) {
    return null;
  }

  const stats = [
    {
      label: "Posts",
      value: data?.content?.posts ?? 0,
      icon: FileTextIcon,
      color: "text-blue-500",
    },
    {
      label: "Media",
      value: data?.media?.total ?? 0,
      icon: ImagesIcon,
      color: "text-purple-500",
    },
    {
      label: "Team",
      value: activeWorkspace?.members?.length ?? 0,
      icon: UsersThreeIcon,
      color: "text-green-500",
    },
  ];

  const apiUsageTotal = data?.api?.totals?.total ?? 0;

  return (
    <div className="space-y-3 px-4 pb-3">
      {/* Workspace Stats Card */}
      <Card className="border-sidebar-border bg-sidebar-accent/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-xs">
            Workspace Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                className="flex flex-col items-center gap-1.5 rounded-md bg-background/50 p-2"
                key={stat.label}
              >
                <stat.icon className={cn("size-4", stat.color)} weight="fill" />
                <div className="text-center">
                  <p className="font-semibold text-sm">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* API Usage */}
          {data?.api && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  API Requests
                </p>
                <p className="font-medium text-[10px]">
                  {apiUsageTotal.toLocaleString()} total
                </p>
              </div>
              <Progress className="h-1.5" value={75} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade to Pro Card */}
      {!isPro && (
        <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/10 to-purple-500/10">
          <CardContent className="space-y-3 p-3">
            <div className="flex items-start gap-2">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <SparkleIcon className="size-4 text-blue-500" weight="fill" />
              </div>
              <div className="flex-1 space-y-0.5">
                <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Unlock Astra AI to write blog posts instantly
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-background/60 p-2">
                <SparkleIcon className="size-3.5 text-blue-500" weight="fill" />
                <p className="flex-1 text-[11px] text-foreground">
                  AI-powered blog creation
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-background/60 p-2">
                <SparkleIcon className="size-3.5 text-blue-500" weight="fill" />
                <p className="flex-1 text-[11px] text-foreground">
                  Smart content suggestions
                </p>
              </div>
            </div>

            <Button
              className="h-8 w-full gap-1.5 text-xs"
              onClick={() => setShowUpgradeModal(true)}
              size="sm"
            >
              <span>Upgrade Now</span>
              <ArrowUpRightIcon className="size-3.5" weight="bold" />
            </Button>

            <Link
              className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              href={`/${params.workspace}/agent`}
            >
              Try Astra AI
              <ArrowUpRightIcon className="size-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pro Badge for Pro Users */}
      {isPro && (
        <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/10 to-purple-500/10">
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <SparkleIcon className="size-4 text-blue-500" weight="fill" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Pro Member</h3>
                <p className="text-[10px] text-muted-foreground">
                  All features unlocked
                </p>
              </div>
            </div>
            <Badge className="text-[10px]" variant="premium">
              PRO
            </Badge>
          </CardContent>
        </Card>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
