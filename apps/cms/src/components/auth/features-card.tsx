"use client";

import { Card, CardContent, CardHeader } from "@astra/ui/components/card";
import { cn } from "@astra/ui/lib/utils";
import {
  CalendarHeartIcon,
  type Icon,
  MapPinIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import type { ReactNode } from "react";

export default function FeaturesCard() {
  return (
    <section className="hidden max-h-screen overflow-hidden border-gray-400 border-r bg-zinc-50 p-4 md:flex dark:border-gray-800 dark:bg-transparent">
      <div className="mx-auto grid gap-4 lg:grid-cols-2">
        <FeatureCard>
          <CardHeader className="px-2 pb-0">
            <CardHeading
              description="Generate ideas, polish your prose, and format your stories with a
              powerful AI."
              icon={MapPinIcon}
              title="Intelligent Writing Partner"
            />
          </CardHeader>

          <div className="relative h-full">
            <div
              aria-hidden
              className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,var(--color-blue-600),var(--color-background)_100%)]"
            />
            <div className="aspect-89/50">
              <DualModeImage
                alt="global network illustration"
                darkSrc="/images/valentine-vintage.png"
                height={929}
                lightSrc="/images/valentine-vintage.png"
                width={1207}
              />
            </div>
          </div>
        </FeatureCard>

        <FeatureCard>
          <CardHeader className="px-2 pb-0">
            <CardHeading
              description="Plan your publishing schedule with advanced scheduling tools."
              icon={CalendarHeartIcon}
              title="Editorial Calendar"
            />
          </CardHeader>

          <CardContent>
            <div className="mask-radial-at-right mask-radial-from-25% mask-radial-[75%_75%] relative max-sm:mb-6">
              <div className="aspect-76/59 overflow-hidden rounded-lg border">
                <DualModeImage
                  alt="calendar illustration"
                  darkSrc="/images/book-on-hand.png"
                  height={929}
                  lightSrc="/images/book-on-hand.png"
                  width={1207}
                />
              </div>
            </div>
          </CardContent>
        </FeatureCard>

        <FeatureCard className="p-2 lg:col-span-2">
          <p className="mx-auto my-6 max-w-md text-balance text-center font-semibold text-2xl">
            Everything you need to manage a professional publication.
          </p>

          <div className="flex justify-center gap-6 overflow-hidden">
            <CircularUI
              circles={[{ pattern: "border" }, { pattern: "border" }]}
              label="SEO"
            />

            <CircularUI
              circles={[{ pattern: "none" }, { pattern: "primary" }]}
              label="Media"
            />

            <CircularUI
              circles={[{ pattern: "blue" }, { pattern: "none" }]}
              label="Tags"
            />

            <CircularUI
              circles={[{ pattern: "primary" }, { pattern: "none" }]}
              className="hidden sm:block"
              label="Users"
            />
          </div>
        </FeatureCard>
      </div>
    </section>
  );
}

type FeatureCardProps = {
  children: ReactNode;
  className?: string;
};

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card
    className={cn(
      "group relative rounded-none p-0 shadow-zinc-950/5",
      className
    )}
  >
    <CardDecorator />
    {children}
  </Card>
);

const CardDecorator = () => (
  <>
    <span className="-left-px -top-px absolute block size-2 border-primary border-t-2 border-l-2" />
    <span className="-right-px -top-px absolute block size-2 border-primary border-t-2 border-r-2" />
    <span className="-bottom-px -left-px absolute block size-2 border-primary border-b-2 border-l-2" />
    <span className="-bottom-px -right-px absolute block size-2 border-primary border-r-2 border-b-2" />
  </>
);

type CardHeadingProps = {
  icon: Icon;
  title: string;
  description: string;
};

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-2 sm:p-4">
    <span className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4" />
      {title}
    </span>
    <p className="mt-8 font-semibold text-2xl">{description}</p>
  </div>
);

type DualModeImageProps = {
  darkSrc: string;
  lightSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

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
      alt={`${alt} dark`}
      className={cn("hidden dark:block", className)}
      height={height}
      src={darkSrc}
      width={width}
    />
    <Image
      alt={`${alt} light`}
      className={cn("shadow dark:hidden", className)}
      height={height}
      src={lightSrc}
      width={width}
    />
  </>
);

type CircleConfig = {
  pattern: "none" | "border" | "primary" | "blue";
};

type CircularUIProps = {
  label: string;
  circles: CircleConfig[];
  className?: string;
};

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
  <div className={className}>
    <div className="size-fit rounded-2xl bg-linear-to-b from-border to-transparent p-px">
      <div className="-space-x-4 relative flex aspect-square w-fit items-center rounded-[15px] bg-linear-to-b from-background to-muted/25 p-4">
        {circles.map((circle, i) => (
          <div
            className={cn("size-7 rounded-full border sm:size-8", {
              "border-primary": circle.pattern === "none",
              "border-primary bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_4px)]":
                circle.pattern === "border",
              "border-primary bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_4px)] bg-background":
                circle.pattern === "primary",
              "z-1 border-blue-500 bg-[repeating-linear-gradient(-45deg,var(--color-blue-500),var(--color-blue-500)_1px,transparent_1px,transparent_4px)] bg-background":
                circle.pattern === "blue",
            })}
            key={i.toString()}
          />
        ))}
      </div>
    </div>
    <span className="mt-1.5 block text-center text-muted-foreground text-sm">
      {label}
    </span>
  </div>
);
