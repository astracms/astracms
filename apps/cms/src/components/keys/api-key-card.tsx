"use client";

import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@astra/ui/components/dropdown-menu";
import { toast } from "@astra/ui/components/sonner";
import {
  CopyIcon,
  DotsThreeVerticalIcon,
  ToggleRightIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { format, isPast } from "date-fns";
import dynamic from "next/dynamic";
import { useState } from "react";
import { maskApiKey } from "@/lib/utils/api-key";
import type { ApiKey } from "@/types/api-key";

const DeleteApiKeyModal = dynamic(() =>
  import("@/components/keys/delete-api-key").then(
    (mod) => mod.DeleteApiKeyModal
  )
);

type ApiKeyCardProps = {
  apiKey: ApiKey;
  onToggle: (data: { id: string; enabled: boolean }) => void;
  onDelete: () => void;
  isToggling: boolean;
  toggleVariables?: { id: string; enabled: boolean };
};

export function ApiKeyCard({
  apiKey,
  onToggle,
  onDelete,
  isToggling,
  toggleVariables,
}: ApiKeyCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    toast.success("Key prefix copied to clipboard");
  };

  const isExpired = apiKey.expiresAt && isPast(new Date(apiKey.expiresAt));

  return (
    <li>
      <Card>
        <CardHeader className="flex justify-between">
          <div className="mb-2 flex items-center gap-3">
            <CardTitle className="text-lg">{apiKey.name}</CardTitle>
            {isExpired ? (
              <Badge className="text-xs" variant="negative">
                Expired
              </Badge>
            ) : (
              <Badge
                className="text-xs"
                variant={apiKey.enabled ? "positive" : "negative"}
              >
                {apiKey.enabled ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <DotsThreeVerticalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={
                  isExpired || (isToggling && toggleVariables?.id === apiKey.id)
                }
                onClick={() =>
                  onToggle({
                    id: apiKey.id,
                    enabled: !apiKey.enabled,
                  })
                }
              >
                <ToggleRightIcon className="mr-1.5" size={16} />
                <span>{apiKey.enabled ? "Disable" : "Enable"} Key</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopyPrefix(apiKey.keyPrefix)}
              >
                <CopyIcon className="mr-1.5 size-4" />
                Copy Key Prefix
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isToggling}
                onSelect={(_e) => setIsOpen(true)}
                variant="destructive"
              >
                <TrashIcon className="mr-1.5 size-4 text-inherit" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-3 line-clamp-1 break-all font-mono text-muted-foreground text-sm">
                {maskApiKey(apiKey.keyPrefix)}
              </p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {apiKey.scopes.map((scope) => (
                  <Badge
                    className="font-mono text-xs"
                    key={scope}
                    variant="secondary"
                  >
                    {scope}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col gap-1 text-muted-foreground text-xs">
                <span>
                  Created {format(new Date(apiKey.createdAt), "MMM d, yyyy")}
                </span>
                {apiKey.lastUsedAt && (
                  <span>
                    Last used{" "}
                    {format(new Date(apiKey.lastUsedAt), "MMM d, yyyy")}
                  </span>
                )}
                {apiKey.expiresAt && (
                  <span className={isExpired ? "text-destructive" : ""}>
                    {isExpired ? "Expired" : "Expires"}{" "}
                    {format(new Date(apiKey.expiresAt), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <DeleteApiKeyModal
        apiKeyId={apiKey.id}
        apiKeyName={apiKey.name}
        isOpen={isOpen}
        onDelete={onDelete}
        onOpenChange={setIsOpen}
      />
    </li>
  );
}
