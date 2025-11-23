"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { cn } from "@astra/ui/lib/utils";
import type { ReactNode } from "react";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  accentColor?: string;
  footer?: ReactNode;
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  description,
  icon,
  trend,
  accentColor = "var(--primary)",
  footer,
  className,
}: DashboardStatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[20px] border-none bg-sidebar p-2.5 transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="flex items-baseline gap-2">
              <p className="font-semibold text-2xl tracking-tight">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    trend.isPositive
                      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
          </div>
          {icon && (
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      {footer && (
        <CardContent className="rounded-[12px] bg-background p-4">
          {footer}
        </CardContent>
      )}
    </Card>
  );
}
