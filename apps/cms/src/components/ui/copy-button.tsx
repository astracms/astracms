"use client";

// biome-ignore lint/style/useImportType: buttonVariants needed for typeof in type definition
import { Button, buttonVariants } from "@astra/ui/components/button";
import { toast } from "@astra/ui/components/sonner";
import { cn } from "@astra/ui/lib/utils";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import { useOptimistic, useTransition } from "react";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    ref?: React.Ref<HTMLButtonElement>;
  };

export function CopyButton({
  textToCopy,
  toastMessage,
  className,
  variant = "outline",
  size = "icon",
  ...props
}: {
  textToCopy: string;
  toastMessage?: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
} & Omit<React.ComponentProps<"button">, "onClick" | "children" | "className">) {
  const [state, setState] = useOptimistic<"idle" | "copied">("idle");
  const [, startTransition] = useTransition();

  return (
    <div
      onClick={() => {
        startTransition(async () => {
          if (!textToCopy) {
            return;
          }
          await navigator.clipboard.writeText(textToCopy);
          if (toastMessage) {
            toast.success(toastMessage);
          }
          setState("copied");
          await new Promise((resolve) => setTimeout(resolve, 1500));
        });
      }}
    >
        <Button
          className={cn("size-9 shadow-none", className)}
          size={size}
          variant={variant}
          tabIndex={-1}
        >
          <span className="sr-only">Copy</span>
          {state === "idle" ? (
            <CopyIcon className="size-4" />
          ) : (
            <CheckIcon className="size-4" />
          )}
        </Button>
      </div>
    );
}
