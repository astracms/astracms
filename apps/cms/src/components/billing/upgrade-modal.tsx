"use client";

import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@astra/ui/components/dialog";
import { cn } from "@astra/ui/lib/utils";
import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { AsyncButton } from "@/components/ui/async-button";
import { authClient } from "@/lib/auth/client";
import { PRICING_PLANS } from "@/lib/constants";
import { useWorkspace } from "@/providers/workspace";

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "free" | null>(
    null
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>("pro");
  const { activeWorkspace } = useWorkspace();

  const currentPlan = activeWorkspace?.subscription?.plan || "free";

  const handleCheckout = async (plan: "pro" | "free") => {
    if (!activeWorkspace?.id) {
      return;
    }

    setCheckoutLoading(plan);

    try {
      // Get the product ID based on the plan
      const productIdMap = {
        free: process.env.NEXT_PUBLIC_CREEM_HOBBY_PRODUCT_ID,
        pro: process.env.NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID,
      };

      const productId = productIdMap[plan];

      if (!productId) {
        toast.error("Product ID not configured for this plan");
        return;
      }

      const { data, error } = await authClient.creem.createCheckout({
        productId,
        successUrl: `${window.location.origin}/success`,
        metadata: {
          workspaceId: activeWorkspace.id,
        },
      });

      if (error) {
        throw error;
      }

      if (data && "url" in data && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to process checkout");
    } finally {
      setCheckoutLoading(null);
      onClose();
    }
  };

  const renderPlanButton = (plan: "free" | "pro") => {
    const isCurrentPlan = currentPlan === plan;

    if (isCurrentPlan) {
      return (
        <Button className="w-full" disabled variant="default">
          Current plan
        </Button>
      );
    }

    return (
      <AsyncButton
        className="w-full"
        isLoading={!!checkoutLoading}
        onClick={() => handleCheckout(plan)}
      >
        Upgrade
      </AsyncButton>
    );
  };

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-h-[700px] overflow-y-auto rounded-[20px] bg-sidebar p-2 sm:max-w-4xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade Plan</DialogTitle>
          <DialogDescription>
            Upgrade your workspace to the pro plan.
          </DialogDescription>
        </DialogHeader>
        <section className="grid grid-cols-10 gap-2">
          <div className="col-span-4">
            {(() => {
              const plan = PRICING_PLANS.find((p) => p.id === selectedPlan);
              if (!plan) {
                return null;
              }

              return (
                <div className="flex h-full min-h-96 w-full flex-col gap-5 rounded-xl bg-background px-4 pt-6 pb-10 shadow-xs">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-2xl text-medium">{plan.title}</h4>
                    <div>
                      <p>
                        <span className="font-bold text-3xl">
                          {plan.price.monthly}
                        </span>{" "}
                        <span>per month.</span>
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <div className="border-y border-dashed py-4">
                    {renderPlanButton(plan.id as "free" | "pro")}
                  </div>
                  <ul className="flex flex-col gap-2 text-sm">
                    {plan.features.map((feature) => (
                      <li className="flex items-center gap-2" key={feature}>
                        <CheckIcon className="size-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
          <ul className="col-span-6 flex flex-col justify-center gap-5 p-4">
            {PRICING_PLANS.map((plan) => (
              <li key={plan.id}>
                <button
                  className={cn(
                    "w-full outline-none transition-[color,box-shadow]",
                    selectedPlan === plan.id &&
                      "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  )}
                  onClick={() => setSelectedPlan(plan.id)}
                  type="button"
                >
                  <Card
                    className={cn(
                      "flex-row items-center justify-start border-transparent bg-background px-6 shadow-xs transition-[color,box-shadow]",
                      selectedPlan === plan.id &&
                        "border-ring ring-[3px] ring-ring/50"
                    )}
                  >
                    <CardContent className="p-0">
                      <div
                        className={cn(
                          "size-5 rounded-full border",
                          selectedPlan === plan.id &&
                            "border-primary bg-primary outline outline-primary outline-offset-2"
                        )}
                      />
                    </CardContent>
                    <CardHeader className="flex w-full flex-col gap-2 px-0 text-start">
                      <div className="flex w-full items-center justify-between">
                        <CardTitle>{plan.title}</CardTitle>
                        {plan.id === currentPlan && (
                          <Badge variant="free">Current Plan</Badge>
                        )}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}
