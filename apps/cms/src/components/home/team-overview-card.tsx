"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@astra/ui/components/avatar";
import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { cn } from "@astra/ui/lib/utils";
import { Plus } from "@phosphor-icons/react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  role: string;
  status?: "active" | "invited" | "pending";
}

interface TeamOverviewCardProps {
  members: TeamMember[];
  maxDisplay?: number;
  onInvite?: () => void;
  className?: string;
}

export function TeamOverviewCard({
  members,
  maxDisplay = 5,
  onInvite,
  className,
}: TeamOverviewCardProps) {
  const displayedMembers = members.slice(0, maxDisplay);
  const hasMore = members.length > maxDisplay;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "active":
        return "positive";
      case "invited":
        return "pending";
      case "pending":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <Card
      className={cn("rounded-[20px] border-none bg-sidebar p-2.5", className)}
    >
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="font-medium text-base">
              Team Members
            </CardTitle>
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs">
              {members.length}
            </span>
          </div>
          {onInvite && (
            <Button
              className="h-8 gap-1 text-xs"
              onClick={onInvite}
              size="sm"
              variant="ghost"
            >
              <Plus className="size-4" />
              Invite
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="rounded-[12px] bg-background p-0">
        <ul className="divide-y divide-border/40">
          {displayedMembers.map((member) => (
            <li
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
              key={member.id}
            >
              <Avatar className="size-9">
                <AvatarImage alt={member.name} src={member.imageUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{member.name}</p>
                  <p className="truncate text-muted-foreground text-xs">
                    {member.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className="text-xs" variant="outline">
                    {member.role}
                  </Badge>
                  {member.status && member.status !== "active" && (
                    <Badge
                      className="text-xs"
                      variant={getStatusVariant(member.status)}
                    >
                      {member.status}
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {hasMore && (
          <div className="border-border/40 border-t px-4 py-3 text-center">
            <button
              className="font-medium text-primary text-xs transition-colors hover:text-primary/80"
              type="button"
            >
              View all {members.length} members →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
