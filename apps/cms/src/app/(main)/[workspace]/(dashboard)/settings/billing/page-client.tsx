"use client";

import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { Progress } from "@astra/ui/components/progress";
import { Separator } from "@astra/ui/components/separator";
import {
  CheckIcon,
  ImagesIcon,
  Lightning,
  PlugsIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkspacePageWrapper } from "@/components/layout/wrapper";
import { AsyncButton } from "@/components/ui/async-button";
import { usePlan } from "@/hooks/use-plan";
import { authClient } from "@/lib/auth/client";
import { PRICING_PLANS } from "@/lib/constants";
import { useWorkspace } from "@/providers/workspace";
import { formatBytes } from "@/utils/string";

interface AICreditStats {
  used: number;
  limit: number;
  remaining: number;
  usagePercentage: number;
  canUseAI: boolean;
}

function PageClient() {
  const { activeWorkspace, isOwner } = useWorkspace();
  const { planLimits, currentMemberCount, currentPlan, currentMediaUsage } =
    usePlan();
  const [checkoutLoading, setCheckoutLoading] = useState<
    "pro" | "free" | "premium" | null
  >(null);
  const [aiCredits, setAICredits] = useState<AICreditStats>({
    used: 0,
    limit: 0,
    remaining: 0,
    usagePercentage: 0,
    canUseAI: false,
  });

  const subscription = activeWorkspace?.subscription;

  // Fetch AI credit usage
  useEffect(() => {
    const fetchAICredits = async () => {
      try {
        const response = await fetch("/api/metrics/ai-credits");
        if (response.ok) {
          const data = await response.json();
          setAICredits(data);
        }
      } catch (error) {
        console.error("Failed to fetch AI credits:", error);
      }
    };

    fetchAICredits();
  }, []);

  const formatDate = useCallback(
    async (dateValue: string | Date | null | undefined) => {
      if (!dateValue) {
        return null;
      }

      const { format: formatFn, isValid, parseISO } = await import("date-fns");
      let date: Date;
      if (typeof dateValue === "string") {
        date = parseISO(dateValue);
      } else {
        date = dateValue;
      }

      if (!isValid(date)) {
        return null;
      }
      return formatFn(date, "MMM d, yyyy");
    },
    []
  );

  const formatApiRequestLimit = (limit: number) => {
    if (limit === -1) {
      return "Unlimited";
    }
    return limit.toLocaleString();
  };

  const formatStorageLimit = (limitMB: number) => {
    if (limitMB >= 1024) {
      return `${(limitMB / 1024).toFixed(0)} GB`;
    }
    return `${limitMB} MB`;
  };

  const [billingCycleText, setBillingCycleText] = useState<string>(
    "Loading billing cycle..."
  );

  const updateBillingCycleText = useCallback(async () => {
    if (!subscription?.currentPeriodStart || !subscription?.currentPeriodEnd) {
      setBillingCycleText("No billing cycle");
      return;
    }

    const startDate = await formatDate(subscription.currentPeriodStart);
    const endDate = await formatDate(subscription.currentPeriodEnd);

    if (!startDate || !endDate) {
      setBillingCycleText("No billing cycle");
      return;
    }

    setBillingCycleText(`${startDate} - ${endDate}`);
  }, [
    subscription?.currentPeriodStart,
    subscription?.currentPeriodEnd,
    formatDate,
  ]);

  useEffect(() => {
    updateBillingCycleText();
  }, [updateBillingCycleText]);

  // Calculate usage percentages
  const maxMediaBytes = planLimits.maxMediaStorage * 1024 * 1024;
  const mediaUsedBytes = currentMediaUsage;
  const mediaRemainingBytes = Math.max(0, maxMediaBytes - mediaUsedBytes);
  const mediaPercent = maxMediaBytes
    ? Math.min(100, Math.round((mediaUsedBytes / maxMediaBytes) * 100))
    : 0;

  const memberMax = planLimits.maxMembers;
  const memberRemaining = Math.max(0, memberMax - currentMemberCount);
  const memberPercent = memberMax
    ? Math.min(100, Math.round((currentMemberCount / memberMax) * 100))
    : 0;

  const apiRequestsPercent = planLimits.maxApiRequests === -1 ? 0 : 0; // 0 requests used

  const redirectCustomerPortal = async () => {
    try {
      await authClient.creem.createPortal();
    } catch (_e) {
      toast.error("Failed to redirect to customer portal");
    }
  };

  const handleCheckout = async (plan: "pro" | "free" | "premium") => {
    if (!activeWorkspace?.id) {
      return;
    }

    setCheckoutLoading(plan);

    try {
      // Get the product ID based on the plan
      const productIdMap = {
        free: process.env.NEXT_PUBLIC_CREEM_HOBBY_PRODUCT_ID,
        pro: process.env.NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID,
        premium: process.env.NEXT_PUBLIC_CREEM_PREMIUM_PRODUCT_ID,
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
    }
  };

  const usageData = [
    {
      name: "AI Credits",
      icon: Lightning,
      used: aiCredits.used.toLocaleString(),
      total: aiCredits.limit > 0 ? aiCredits.limit.toLocaleString() : "N/A",
      percentage: aiCredits.usagePercentage,
      remaining: aiCredits.remaining.toLocaleString(),
      highlight: aiCredits.limit === 0 ? "No AI access" : undefined,
    },
    {
      name: "API Requests",
      icon: PlugsIcon,
      used: "0",
      total: formatApiRequestLimit(planLimits.maxApiRequests),
      percentage: apiRequestsPercent,
      remaining: formatApiRequestLimit(planLimits.maxApiRequests),
    },
    {
      name: "Media Storage",
      icon: ImagesIcon,
      used: formatBytes(mediaUsedBytes),
      total: formatStorageLimit(planLimits.maxMediaStorage),
      percentage: mediaPercent,
      remaining: formatBytes(mediaRemainingBytes),
    },
    {
      name: "Team Members",
      icon: UsersIcon,
      used: currentMemberCount.toString(),
      total: memberMax.toString(),
      percentage: memberPercent,
      remaining: memberRemaining.toString(),
    },
  ];

  return (
    <WorkspacePageWrapper className="flex flex-col gap-8 py-12" size="compact">
      {/* Pricing Plans */}
      {isOwner && (
        <>
          <div className="mb-6">
            <h2 className="font-semibold text-2xl">Available Plans</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Choose the plan that fits your needs. Upgrade or downgrade
              anytime.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => {
              const isCurrentPlan = currentPlan === plan.id;

              return (
                <Card
                  className={
                    isCurrentPlan ? "border-primary ring-1 ring-primary" : ""
                  }
                  key={plan.id}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.title}</CardTitle>
                      {isCurrentPlan && (
                        <Badge className="font-normal" variant="default">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="font-bold text-4xl">
                        {plan.price.monthly}
                      </span>
                      <span className="text-muted-foreground"> /month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Separator className="mb-4" />
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li className="flex items-start gap-3" key={feature}>
                          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <CheckIcon
                              className="size-3 text-primary"
                              weight="bold"
                            />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button className="w-full" disabled variant="secondary">
                        Current Plan
                      </Button>
                    ) : (
                      <AsyncButton
                        className="w-full cursor-pointer"
                        isLoading={checkoutLoading === plan.id}
                        onClick={() =>
                          handleCheckout(plan.id as "pro" | "free" | "premium")
                        }
                      >
                        {plan.id === "free"
                          ? "Downgrade to Hobby"
                          : "Start 7-Day Free Trial"}
                      </AsyncButton>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </WorkspacePageWrapper>
  );
}

export default PageClient;
