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
  PlugsIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkspacePageWrapper } from "@/components/layout/wrapper";
import { AsyncButton } from "@/components/ui/async-button";
import { usePlan } from "@/hooks/use-plan";
import { authClient, checkout } from "@/lib/auth/client";
import { PRICING_PLANS } from "@/lib/constants";
import { useWorkspace } from "@/providers/workspace";
import { formatBytes } from "@/utils/string";

function PageClient() {
  const { activeWorkspace, isOwner } = useWorkspace();
  const { planLimits, currentMemberCount, currentPlan, currentMediaUsage } =
    usePlan();
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "free" | null>(
    null
  );

  const subscription = activeWorkspace?.subscription;

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

  const getPlanDisplayName = () => {
    switch (currentPlan) {
      case "pro":
        return "Pro Plan";
      case "team":
        return "Team Plan";
      default:
        return "Hobby Plan";
    }
  };

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
      await authClient.customer.portal();
    } catch (_e) {
      toast.error("Failed to redirect to customer portal");
    }
  };

  const handleCheckout = async (plan: "pro" | "free") => {
    if (!activeWorkspace?.id) {
      return;
    }

    setCheckoutLoading(plan);

    try {
      await checkout({
        slug: plan,
        referenceId: activeWorkspace.id,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to process checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const usageData = [
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
      {/* Usage Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>
            Track your usage across API requests, storage, and team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 rounded-lg bg-muted/50 p-6 md:grid-cols-3 md:divide-x">
            {usageData.map((item) => (
              <div
                className="flex items-center gap-4 px-4 first:pl-0 last:pr-0"
                key={item.name}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-muted-foreground text-sm">{item.name}</p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {item.percentage}%
                    </p>
                  </div>
                  <Progress className="h-2" value={item.percentage} />
                  <div className="flex items-baseline gap-1">
                    <p className="font-semibold text-sm">{item.used}</p>
                    <p className="text-muted-foreground text-xs">
                      / {item.total}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

          <div className="grid gap-6 md:grid-cols-2">
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
                        className="w-full"
                        isLoading={checkoutLoading === plan.id}
                        onClick={() =>
                          handleCheckout(plan.id as "pro" | "free")
                        }
                      >
                        {plan.id === "free"
                          ? "Downgrade to Hobby"
                          : "Upgrade to Pro"}
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
