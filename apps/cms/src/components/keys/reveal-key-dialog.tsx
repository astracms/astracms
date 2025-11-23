"use client";

import { Button } from "@astra/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@astra/ui/components/dialog";
import { toast } from "@astra/ui/components/sonner";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { ApiKeyWithPlainKey } from "@/types/api-key";

type RevealKeyDialogProps = {
  apiKey: ApiKeyWithPlainKey;
  open: boolean;
  onClose: () => void;
};

export function RevealKeyDialog({
  apiKey,
  open,
  onClose,
}: RevealKeyDialogProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.plainKey);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy API key");
    }
  };

  const maskKey = (key: string) => {
    if (!revealed) {
      const prefix = key.substring(0, 12);
      return `${prefix}${"*".repeat(32)}`;
    }
    return key;
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            Make sure to copy your API key now. You won't be able to see it
            again!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">Key Name</p>
            <p className="text-muted-foreground text-sm">{apiKey.name}</p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">API Key</p>
            <div className="flex items-center justify-between gap-2 rounded-md border bg-muted p-3">
              <code className="break-all font-mono text-sm">
                {maskKey(apiKey.plainKey)}
              </code>
              <div className="flex shrink-0 gap-1">
                <Button
                  onClick={() => setRevealed(!revealed)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {revealed ? (
                    <EyeSlashIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </Button>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {copied ? (
                    <CheckIcon className="size-4 text-green-500" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-destructive text-xs">
              ⚠️ This is the only time you'll see this key. Store it securely!
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {apiKey.scopes.map((scope) => (
                <span
                  className="rounded-md bg-secondary px-2 py-1 font-mono text-secondary-foreground text-xs"
                  key={scope}
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
          {apiKey.expiresAt && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Expires At</p>
              <p className="text-muted-foreground text-sm">
                {new Date(apiKey.expiresAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} type="button">
            I've saved my API key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
