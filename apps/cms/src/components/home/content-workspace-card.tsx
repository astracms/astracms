"use client";

import { Card } from "@astra/ui/components/card";
import { Badge } from "@astra/ui/components/badge";
import { cn } from "@astra/ui/lib/utils";
import { UserAvatarStack } from "./user-avatar-stack";
import Link from "next/link";
import type { ReactNode } from "react";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  href: string;
  thumbnail?: ReactNode;
  status?: {
    label: string;
    variant?: "default" | "secondary" | "outline" | "positive" | "negative" | "pending";
  };
  editors?: Array<{
    name: string;
    imageUrl?: string;
    email?: string;
  }>;
  metadata?: {
    label: string;
    value: string;
  }[];
}

interface ContentWorkspaceCardProps {
  title: string;
  count?: number;
  items: ContentItem[];
  emptyMessage?: string;
  className?: string;
}

function ContentPlaceholder() {
  return (
    <div className="relative h-full overflow-hidden rounded bg-muted">
      <svg
        className="absolute inset-0 size-full stroke-border"
        fill="none"
      >
        <defs>
          <pattern
            id="content-pattern"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
          </pattern>
        </defs>
        <rect
          stroke="none"
          fill="url(#content-pattern)"
          width="100%"
          height="100%"
        />
      </svg>
    </div>
  );
}

export function ContentWorkspaceCard({
  title,
  count,
  items,
  emptyMessage = "No content available",
  className,
}: ContentWorkspaceCardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-sm">{title}</h3>
        {count !== undefined && (
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
            {count}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center rounded-[20px] border border-dashed border-border bg-muted/20 py-12 text-muted-foreground text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[20px] border-none bg-sidebar p-0 transition-all hover:shadow-lg"
            >
              <div className="p-2">
                <div className="h-28 overflow-hidden rounded-lg">
                  {item.thumbnail || <ContentPlaceholder />}
                </div>
                <div className="space-y-2 px-2 pt-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 font-medium text-sm">
                      {item.title}
                    </h4>
                    {item.status && (
                      <Badge variant={item.status.variant} className="shrink-0">
                        {item.status.label}
                      </Badge>
                    )}
                  </div>
                  <p className="line-clamp-2 text-muted-foreground text-xs">
                    {item.description}
                  </p>
                  {item.metadata && item.metadata.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                      {item.metadata.map((meta, index) => (
                        <span
                          key={index}
                          className="text-muted-foreground text-xs"
                        >
                          <span className="font-medium">{meta.label}:</span>{" "}
                          {meta.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 bg-background/50 px-4 py-3">
                {item.editors && item.editors.length > 0 ? (
                  <UserAvatarStack users={item.editors} max={3} />
                ) : (
                  <div />
                )}
                <Link
                  href={item.href}
                  className="font-medium text-primary text-xs transition-colors hover:text-primary/80"
                >
                  View more →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
