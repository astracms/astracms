/**
 * Dashboard Components Examples
 *
 * This file demonstrates how to use all the new dashboard components
 * with sample data. Use these examples as a reference when integrating
 * with your actual data sources.
 */

"use client";

import { DashboardGrid } from "./dashboard-grid";
import { DashboardStatCard } from "./dashboard-stat-card";
import { DashboardChartCard } from "./dashboard-chart-card";
import { DashboardListCard } from "./dashboard-list-card";
import { ContentWorkspaceCard } from "./content-workspace-card";
import { TeamOverviewCard } from "./team-overview-card";
import { PlanUsageCard } from "./plan-usage-card";
import { UserAvatarStack } from "./user-avatar-stack";
import {
  FileText,
  Users,
  TrendUp,
  Calendar,
  Clock,
  CheckCircle,
} from "@phosphor-icons/react";

export function DashboardExamples() {
  // Example 1: Quick Stats Grid
  const quickStats = [
    {
      title: "Total Posts",
      value: "124",
      description: "Published and draft",
      icon: <FileText className="size-5" />,
      accentColor: "hsl(var(--chart-1))",
      trend: { value: 12, label: "from last month", isPositive: true },
    },
    {
      title: "Active Users",
      value: "1,234",
      description: "This month",
      icon: <Users className="size-5" />,
      accentColor: "hsl(var(--chart-2))",
      trend: { value: 8, label: "from last month", isPositive: true },
    },
    {
      title: "Engagement",
      value: "89%",
      description: "Average rate",
      icon: <TrendUp className="size-5" />,
      accentColor: "hsl(var(--chart-3))",
      trend: { value: 3, label: "from last month", isPositive: true },
    },
    {
      title: "Published Today",
      value: "7",
      description: "New articles",
      icon: <Calendar className="size-5" />,
      accentColor: "hsl(var(--chart-4))",
    },
  ];

  // Example 2: Recent Content
  const recentContent = [
    {
      id: "1",
      title: "Getting Started with Next.js 15",
      description:
        "A comprehensive guide to building modern web applications with Next.js 15 and React Server Components.",
      href: "/posts/1",
      status: { label: "Published", variant: "positive" as const },
      editors: [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
      ],
      metadata: [
        { label: "Updated", value: "2 hours ago" },
        { label: "Views", value: "1.2k" },
      ],
    },
    {
      id: "2",
      title: "Design System Best Practices",
      description:
        "Learn how to build and maintain a scalable design system for your organization.",
      href: "/posts/2",
      status: { label: "Draft", variant: "pending" as const },
      editors: [{ name: "Alice Johnson", email: "alice@example.com" }],
      metadata: [{ label: "Updated", value: "5 hours ago" }],
    },
    {
      id: "3",
      title: "API Security Fundamentals",
      description:
        "Essential security practices for building secure RESTful APIs.",
      href: "/posts/3",
      status: { label: "Review", variant: "secondary" as const },
      editors: [
        { name: "Bob Wilson", email: "bob@example.com" },
        { name: "Carol Davis", email: "carol@example.com" },
        { name: "David Lee", email: "david@example.com" },
      ],
      metadata: [
        { label: "Updated", value: "1 day ago" },
        { label: "Comments", value: "5" },
      ],
    },
  ];

  // Example 3: List Card
  const recentActivity = [
    {
      id: "1",
      title: "Post published",
      subtitle: "Getting Started with Next.js 15",
      value: "2h ago",
      icon: <CheckCircle className="size-4" />,
      accentColor: "hsl(var(--chart-1))",
    },
    {
      id: "2",
      title: "New comment",
      subtitle: "User feedback on API documentation",
      value: "3h ago",
      icon: <Clock className="size-4" />,
      accentColor: "hsl(var(--chart-2))",
      badge: { label: "New", variant: "secondary" as const },
    },
    {
      id: "3",
      title: "Draft created",
      subtitle: "Design System Best Practices",
      value: "5h ago",
      icon: <FileText className="size-4" />,
      accentColor: "hsl(var(--chart-3))",
    },
  ];

  // Example 4: Team Members
  const teamMembers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active" as const,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Editor",
      status: "active" as const,
    },
    {
      id: "3",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Writer",
      status: "invited" as const,
    },
  ];

  // Example 5: Plan Usage
  const usageItems = [
    {
      label: "API Requests",
      used: 8500,
      limit: 10000,
      unit: "requests",
      color: "hsl(var(--chart-1))",
    },
    {
      label: "Storage",
      used: 2.4,
      limit: 5,
      unit: "GB",
      color: "hsl(var(--chart-2))",
    },
    {
      label: "Team Members",
      used: 3,
      limit: 5,
      unit: "users",
      color: "hsl(var(--chart-3))",
    },
  ];

  // Example 6: Avatar Stack
  const users = [
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Smith", email: "jane@example.com" },
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Wilson", email: "bob@example.com" },
    { name: "Carol Davis", email: "carol@example.com" },
  ];

  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="mb-4 font-semibold text-2xl">
          Dashboard Components Examples
        </h2>
        <p className="text-muted-foreground">
          Reference implementation for all dashboard components
        </p>
      </div>

      {/* Example 1: Quick Stats */}
      <section className="space-y-4">
        <h3 className="font-medium text-lg">1. Quick Stats Grid</h3>
        <DashboardGrid columns={2}>
          {quickStats.map((stat) => (
            <DashboardStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              accentColor={stat.accentColor}
              trend={stat.trend}
            />
          ))}
        </DashboardGrid>
      </section>

      {/* Example 2: Content Workspace */}
      <section className="space-y-4">
        <h3 className="font-medium text-lg">2. Content Workspace Cards</h3>
        <ContentWorkspaceCard
          title="Recent Content"
          count={recentContent.length}
          items={recentContent}
        />
      </section>

      {/* Example 3: Activity List */}
      <section className="space-y-4">
        <h3 className="font-medium text-lg">3. Activity List</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardListCard
            title="Recent Activity"
            count={recentActivity.length}
            items={recentActivity}
          />
          <DashboardChartCard
            title="Sample Chart Card"
            subtitle="This is a placeholder for charts"
            dateRange="Last 30 days"
          >
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Add your chart component here (Recharts, Chart.js, etc.)
            </div>
          </DashboardChartCard>
        </div>
      </section>

      {/* Example 4: Team & Plan */}
      <section className="space-y-4">
        <h3 className="font-medium text-lg">4. Team & Plan Overview</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <TeamOverviewCard
            members={teamMembers}
            onInvite={() => console.log("Invite clicked")}
          />
          <PlanUsageCard
            planName="Professional Plan"
            planBadge={{ label: "Premium", variant: "premium" }}
            usageItems={usageItems}
            onUpgrade={() => console.log("Upgrade clicked")}
          />
        </div>
      </section>

      {/* Example 5: Avatar Stack */}
      <section className="space-y-4">
        <h3 className="font-medium text-lg">5. Avatar Stack</h3>
        <div className="flex items-center gap-4">
          <UserAvatarStack users={users} max={3} size="sm" />
          <UserAvatarStack users={users} max={3} size="md" />
          <UserAvatarStack users={users} max={3} size="lg" />
        </div>
      </section>
    </div>
  );
}
