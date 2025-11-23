"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { Badge } from "@astra/ui/components/badge";
import { cn } from "@astra/ui/lib/utils";
import type { ReactNode } from "react";

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "outline" | "positive" | "negative" | "pending";
  };
  icon?: ReactNode;
  accentColor?: string;
  action?: ReactNode;
}

interface DashboardListCardProps {
  title: string;
  count?: number;
  items: ListItem[];
  emptyMessage?: string;
  footer?: ReactNode;
  className?: string;
}

export function DashboardListCard({
  title,
  count,
  items,
  emptyMessage = "No items to display",
  footer,
  className,
}: DashboardListCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[20px] border-none bg-sidebar p-2.5",
        className
      )}
    >
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {count !== undefined && (
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {count}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="rounded-[12px] bg-background p-0">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                {item.accentColor && (
                  <span
                    className="h-full w-1 shrink-0 rounded"
                    style={{ backgroundColor: item.accentColor }}
                    aria-hidden="true"
                  />
                )}
                {item.icon && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {item.icon}
                  </div>
                )}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-muted-foreground text-xs">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.badge && (
                      <Badge variant={item.badge.variant}>
                        {item.badge.label}
                      </Badge>
                    )}
                    {item.value && (
                      <p className="font-medium text-sm">{item.value}</p>
                    )}
                    {item.action}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {footer && (
        <div className="border-t border-border/40 px-4 pb-3 pt-3">
          {footer}
        </div>
      )}
    </Card>
  );
}
