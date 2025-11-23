"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@astra/ui/components/avatar";
import { cn } from "@astra/ui/lib/utils";

interface User {
  name: string;
  imageUrl?: string;
  email?: string;
}

interface UserAvatarStackProps {
  users: User[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatarStack({
  users,
  max = 3,
  size = "sm",
  className,
}: UserAvatarStackProps) {
  const displayedUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const sizeClasses = {
    sm: "size-5",
    md: "size-8",
    lg: "size-10",
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className={cn("-space-x-1.5 flex", className)}>
      {displayedUsers.map((user, index) => (
        <Avatar
          className={cn(
            sizeClasses[size],
            "ring-2 ring-background dark:ring-dark-tremor-background"
          )}
          key={`${user.email || user.name}-${index}`}
        >
          <AvatarImage alt={user.name} src={user.imageUrl} />
          <AvatarFallback className="text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs ring-2 ring-background"
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
