"use client";

import { Card, CardContent, CardHeader } from "@astra/ui/components/card";
import { cn } from "@astra/ui/lib/utils";
import {
  CalendarHeartIcon,
  type Icon,
  MapPinIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { ReactNode } from "react";

export default function FeaturesCard() {
  return (
    <section className="bg-zinc-50 p-4 border-r border-gray-400 dark:border-gray-800 overflow-hidden max-h-screen hidden md:flex dark:bg-transparent">
      <div className="mx-auto grid gap-4 lg:grid-cols-2">
        <FeatureCard>
          <CardHeader className="pb-0">
            <CardHeading
              icon={MapPinIcon}
              title="Real time location tracking"
              description="Advanced tracking system, Instantly locate all your assets."
            />
          </CardHeader>

          <div className="relative border-t border-dashed max-sm:mb-6">
            <div
              aria-hidden
              className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,var(--color-blue-600),var(--color-white)_100%)]"
            />
            <div className="aspect-76/59 p-1 px-6">
              <DualModeImage
                darkSrc="/payments.png"
                lightSrc="/payments-light.png"
                alt="payments illustration"
                width={1207}
                height={929}
              />
            </div>
          </div>
        </FeatureCard>

        <FeatureCard>
          <CardHeader className="pb-0">
            <CardHeading
              icon={CalendarHeartIcon}
              title="Advanced Scheduling"
              description="Scheduling system, Instantly locate all your assets."
            />
          </CardHeader>

          <CardContent>
            <div className="mask-radial-at-right mask-radial-from-75% mask-radial-[75%_75%] relative max-sm:mb-6">
              <div className="aspect-76/59 overflow-hidden rounded-lg border">
                <DualModeImage
                  darkSrc="/origin-cal-dark.png"
                  lightSrc="/origin-cal.png"
                  alt="calendar illustration"
                  width={1207}
                  height={929}
                />
              </div>
            </div>
          </CardContent>
        </FeatureCard>

        <FeatureCard className="p-2 lg:col-span-2">
          <p className="mx-auto my-6 max-w-md text-balance text-center text-2xl font-semibold">
            Smart scheduling with automated reminders for maintenance.
          </p>

          <div className="flex justify-center gap-6 overflow-hidden">
            <CircularUI
              label="Inclusion"
              circles={[{ pattern: "border" }, { pattern: "border" }]}
            />

            <CircularUI
              label="Inclusion"
              circles={[{ pattern: "none" }, { pattern: "primary" }]}
            />

            <CircularUI
              label="Join"
              circles={[{ pattern: "blue" }, { pattern: "none" }]}
            />

            <CircularUI
              label="Exclusion"
              circles={[{ pattern: "primary" }, { pattern: "none" }]}
              className="hidden sm:block"
            />
          </div>
        </FeatureCard>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card
    className={cn(
      "group relative p-0 rounded-none shadow-zinc-950/5",
      className,
    )}
  >
    <CardDecorator />
    {children}
  </Card>
);

const CardDecorator = () => (
  <>
    <span className="border-primary absolute -left-px -top-px block size-2 border-l-2 border-t-2"></span>
    <span className="border-primary absolute -right-px -top-px block size-2 border-r-2 border-t-2"></span>
    <span className="border-primary absolute -bottom-px -left-px block size-2 border-b-2 border-l-2"></span>
    <span className="border-primary absolute -bottom-px -right-px block size-2 border-b-2 border-r-2"></span>
  </>
);

interface CardHeadingProps {
  icon: Icon;
  title: string;
  description: string;
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-6">
    <span className="text-muted-foreground flex items-center gap-2">
      <Icon className="size-4" />
      {title}
    </span>
    <p className="mt-8 text-2xl font-semibold">{description}</p>
  </div>
);

interface DualModeImageProps {
  darkSrc: string;
  lightSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const DualModeImage = ({
  darkSrc,
  lightSrc,
  alt,
  width,
  height,
  className,
}: DualModeImageProps) => (
  <>
    <Image
      src={darkSrc}
      className={cn("hidden dark:block", className)}
      alt={`${alt} dark`}
      width={width}
      height={height}
    />
    <Image
      src={lightSrc}
      className={cn("shadow dark:hidden", className)}
      alt={`${alt} light`}
      width={width}
      height={height}
    />
  </>
);

interface CircleConfig {
  pattern: "none" | "border" | "primary" | "blue";
}

interface CircularUIProps {
  label: string;
  circles: CircleConfig[];
  className?: string;
}

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
  <div className={className}>
    <div className="bg-linear-to-b from-border size-fit rounded-2xl to-transparent p-px">
      <div className="bg-linear-to-b from-background to-muted/25 relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-4">
        {circles.map((circle, i) => (
          <div
            key={i}
            className={cn("size-7 rounded-full border sm:size-8", {
              "border-primary": circle.pattern === "none",
              "border-primary bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_4px)]":
                circle.pattern === "border",
              "border-primary bg-background bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_4px)]":
                circle.pattern === "primary",
              "bg-background z-1 border-blue-500 bg-[repeating-linear-gradient(-45deg,var(--color-blue-500),var(--color-blue-500)_1px,transparent_1px,transparent_4px)]":
                circle.pattern === "blue",
            })}
          ></div>
        ))}
      </div>
    </div>
    <span className="text-muted-foreground mt-1.5 block text-center text-sm">
      {label}
    </span>
  </div>
);
