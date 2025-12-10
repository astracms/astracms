"use client";

import { FileText, FolderOpen, Tag, Users } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { ApiUsageCard } from "@/components/home/api-usage-card";
import { ContentWorkspaceCard } from "@/components/home/content-workspace-card";
import { DashboardGrid } from "@/components/home/dashboard-grid";
import { DashboardStatCard } from "@/components/home/dashboard-stat-card";
import { MediaUsageCard } from "@/components/home/media-usage-card";
import { WebhookUsageCard } from "@/components/home/webhook-usage-card";
import { WorkspacePageWrapper } from "@/components/layout/wrapper";
import PageLoader from "@/components/shared/page-loader";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { QUERY_KEYS } from "@/lib/queries/keys";
import type { UsageDashboardData } from "@/types/usage-dashboard";

export default function PageClient() {
  const workspaceId = useWorkspaceId();

  const { data, isPending, isError } = useQuery({
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

  if (isPending) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <div className="text-muted-foreground text-sm">
        Unable to load dashboard metrics right now.
      </div>
    );
  }

  // Quick stats from API content counts
  const quickStats = [
    {
      title: "Total Posts",
      value: String(data?.content?.posts ?? 0),
      description: "Published and draft",
      icon: <FileText className="size-5" />,
      accentColor: "hsl(var(--chart-1))",
    },
    {
      title: "Authors",
      value: String(data?.content?.authors ?? 0),
      description: "Active contributors",
      icon: <Users className="size-5" />,
      accentColor: "hsl(var(--chart-2))",
    },
    {
      title: "Categories",
      value: String(data?.content?.categories ?? 0),
      description: "Content categories",
      icon: <FolderOpen className="size-5" />,
      accentColor: "hsl(var(--chart-3))",
    },
    {
      title: "Tags",
      value: String(data?.content?.tags ?? 0),
      description: "Content tags",
      icon: <Tag className="size-5" />,
      accentColor: "hsl(var(--chart-4))",
    },
  ];

  // Mock data for recent content - replace with real data
  const recentContent: Array<{
    id: string;
    title: string;
    description: string;
    href: string;
    thumbnail?: React.ReactNode;
    status?: {
      label: string;
      variant?:
        | "default"
        | "secondary"
        | "outline"
        | "positive"
        | "negative"
        | "pending";
    };
    editors?: Array<{
      name: string;
      imageUrl?: string;
      email?: string;
    }>;
    metadata?: Array<{
      label: string;
      value: string;
    }>;
  }> = [];

  return (
    <WorkspacePageWrapper
      className="flex flex-col gap-8 pt-10 pb-16"
      size="compact"
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="font-semibold text-3xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your workspace.
          </p>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="mb-4 font-medium text-muted-foreground text-sm">
            Quick Overview
          </h2>
          <DashboardGrid columns={2}>
            {quickStats.map((stat) => (
              <DashboardStatCard
                accentColor={stat.accentColor}
                description={stat.description}
                icon={stat.icon}
                key={stat.title}
                title={stat.title}
                value={stat.value}
              />
            ))}
          </DashboardGrid>
        </div>

        {/* Usage Metrics */}
        <div>
          <h2 className="mb-4 font-medium text-muted-foreground text-sm">
            Usage & Activity
          </h2>
          <div className="space-y-8">
            <ApiUsageCard data={data?.api} isLoading={isPending} />
            <div className="grid gap-8 lg:grid-cols-2">
              <WebhookUsageCard data={data?.webhooks} isLoading={isPending} />
              <MediaUsageCard data={data?.media} isLoading={isPending} />
            </div>
          </div>
        </div>

        {/* Recent Content */}
        {recentContent.length > 0 && (
          <div>
            <ContentWorkspaceCard
              count={recentContent.length}
              emptyMessage="No recent content"
              items={recentContent}
              title="Recent Content"
            />
          </div>
        )}
      </div>
    </WorkspacePageWrapper>
  );
}
