"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import { Progress } from "@astra/ui/components/progress";
import { cn } from "@astra/ui/lib/utils";
import { ArrowUpRight } from "@phosphor-icons/react";

interface UsageItem {
  label: string;
  used: number;
  limit: number;
  unit: string;
  color?: string;
}

interface PlanUsageCardProps {
  planName: string;
  planBadge?: {
    label: string;
    variant?: "default" | "secondary" | "premium" | "free";
  };
  usageItems: UsageItem[];
  onUpgrade?: () => void;
  className?: string;
}

export function PlanUsageCard({
  planName,
  planBadge,
  usageItems,
  onUpgrade,
  className,
}: PlanUsageCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(num);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number, customColor?: string) => {
    if (customColor) return customColor;
    if (percentage >= 90) return "hsl(var(--destructive))";
    if (percentage >= 75) return "hsl(var(--chart-3))";
    return "hsl(var(--primary))";
  };

  return (
    <Card
      className={cn("rounded-[20px] border-none bg-sidebar p-2.5", className)}
    >
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">{planName}</CardTitle>
            {planBadge && (
              <Badge variant={planBadge.variant}>{planBadge.label}</Badge>
            )}
          </div>
          {onUpgrade && (
            <Button
              size="sm"
              variant="outline"
              onClick={onUpgrade}
              className="h-8 gap-1 text-xs"
            >
              Upgrade
              <ArrowUpRight className="size-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 rounded-[12px] bg-background p-4">
        {usageItems.map((item, index) => {
          const percentage = getUsagePercentage(item.used, item.limit);
          const isNearLimit = percentage >= 75;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {item.label}
                </span>
                <span className="font-medium text-sm">
                  {formatNumber(item.used)} / {formatNumber(item.limit)}{" "}
                  {item.unit}
                </span>
              </div>
              <div className="space-y-1">
                <Progress
                  value={percentage}
                  className="h-2"
                  style={
                    {
                      "--progress-color": getUsageColor(percentage, item.color),
                    } as React.CSSProperties
                  }
                />
                {isNearLimit && (
                  <p className="text-amber-600 text-xs dark:text-amber-400">
                    {percentage >= 90
                      ? "⚠️ Almost at limit"
                      : "Approaching limit"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
