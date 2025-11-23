"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { cn } from "@astra/ui/lib/utils";
import type { ReactNode } from "react";

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  dateRange?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardChartCard({
  title,
  subtitle,
  value,
  dateRange,
  children,
  headerAction,
  footer,
  className,
  contentClassName,
}: DashboardChartCardProps) {
  return (
    <Card
      className={cn(
        "gap-4 rounded-[20px] border-none bg-sidebar p-2.5",
        className
      )}
    >
      <CardHeader className="gap-0 px-4 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
            {value && (
              <p className="font-medium text-muted-foreground text-xl leading-none tracking-tight">
                {value}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {dateRange && (
              <p className="rounded-full px-3 py-1 text-muted-foreground text-xs">
                {dateRange}
              </p>
            )}
            {headerAction}
          </div>
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "rounded-[12px] bg-background p-4 pt-8 shadow-xs",
          contentClassName
        )}
      >
        {children}
      </CardContent>
      {footer && (
        <div className="border-border/40 border-t px-4 pt-3 pb-3">{footer}</div>
      )}
    </Card>
  );
}
