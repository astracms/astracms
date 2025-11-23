import { cn } from "@astra/ui/lib/utils";
import type { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function DashboardGrid({
  children,
  className,
  columns = 3,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        {
          "grid-cols-1": columns === 1,
          "grid-cols-1 lg:grid-cols-2": columns === 2,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": columns === 3,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
