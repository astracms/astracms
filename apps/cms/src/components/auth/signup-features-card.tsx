"use client";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@astra/ui/components/chart";
import { ChatDotsIcon, MapPinIcon, PiIcon, Rss } from "@phosphor-icons/react";
import DottedMap from "dotted-map";
import { Area, AreaChart, CartesianGrid } from "recharts";

export default function SignupFeaturesCard() {
  return (
    <section className="max-h-screen overflow-hidden">
      <div className="mx-auto grid max-w-5xl border md:grid-cols-2">
        <div>
          <div className="p-6 sm:p-12">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPinIcon className="size-4" />
              Intelligent Writing Partner
            </span>

            <p className="mt-8 font-semibold text-2xl">
              Generate ideas, polish your prose, and format your stories with a
              powerful AI.
            </p>
          </div>

          <div aria-hidden className="relative">
            <div className="absolute inset-0 z-10 m-auto size-fit">
              <div className="relative z-1 flex size-fit w-fit items-center gap-2 rounded-lg border bg-background px-3 py-1 font-medium text-xs shadow-md shadow-zinc-950/5 dark:bg-muted">
                <span className="text-lg">🇨🇩</span> Traffic from Kinshasa, DRC
              </div>
              <div className="-bottom-2 absolute inset-2 mx-auto rounded-lg border bg-background px-3 py-4 font-medium text-xs shadow-md shadow-zinc-950/5 dark:bg-zinc-900" />
            </div>

            <div className="relative overflow-hidden">
              <div className="absolute inset-0 z-1 bg-radial from-transparent to-75% to-background" />
              <Map />
            </div>
          </div>
        </div>
        <div className="overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
          <div className="relative z-10">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ChatDotsIcon className="size-4" />
              Team Collaboration
            </span>

            <p className="my-8 font-semibold text-2xl">
              Collaborate on drafts and streamline your editorial workflow.
            </p>
          </div>
          <div aria-hidden className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-5 rounded-full border">
                  <PiIcon className="m-auto size-3" />
                </span>
                <span className="text-muted-foreground text-xs">Today</span>
              </div>
              <div className="mt-1.5 w-3/5 rounded-lg border bg-background p-3 text-xs">
                Ready to review the new landing page copy?
              </div>
            </div>

            <div>
              <div className="mb-1 ml-auto w-3/5 rounded-lg bg-blue-600 p-3 text-white text-xs">
                Looks perfect! I've approved it for publication.
              </div>
              <span className="block text-right text-muted-foreground text-xs">
                Just now
              </span>
            </div>
          </div>
        </div>
        <div className="col-span-full border-y p-12">
          <p className="text-center font-semibold text-4xl lg:text-7xl">
            Reader Analytics
          </p>
        </div>
        <div className="relative col-span-full">
          <div className="absolute z-10 max-w-lg px-6 pt-6 pr-12 md:px-12 md:pt-12">
            <p className="my-8 font-semibold text-2xl">
              Track detailed engagement metrics.{" "}
              <span className="text-muted-foreground">
                {" "}
                Know exactly what content performs best.
              </span>
            </p>
          </div>
          <MonitoringChart />
        </div>
      </div>
    </section>
  );
}

const map = new DottedMap({ height: 55, grid: "diagonal" });

const points = map.getPoints();

const svgOptions = {
  backgroundColor: "var(--color-background)",
  color: "currentColor",
  radius: 0.15,
};

const Map = () => {
  const viewBox = "0 0 120 60";
  return (
    <svg style={{ background: svgOptions.backgroundColor }} viewBox={viewBox}>
      {points.map((point, index) => (
        <circle
          cx={point.x}
          cy={point.y}
          fill={svgOptions.color}
          key={index}
          r={svgOptions.radius}
        />
      ))}
    </svg>
  );
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "May", desktop: 56, mobile: 224 },
  { month: "June", desktop: 56, mobile: 224 },
  { month: "January", desktop: 126, mobile: 252 },
  { month: "February", desktop: 205, mobile: 410 },
  { month: "March", desktop: 200, mobile: 126 },
  { month: "April", desktop: 400, mobile: 800 },
];

const MonitoringChart = () => (
  <ChartContainer className="aspect-auto h-120 md:h-96" config={chartConfig}>
    <AreaChart
      accessibilityLayer
      data={chartData}
      margin={{
        left: 0,
        right: 0,
      }}
    >
      <defs>
        <linearGradient id="fillDesktop" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-desktop)"
            stopOpacity={0.8}
          />
          <stop
            offset="55%"
            stopColor="var(--color-desktop)"
            stopOpacity={0.1}
          />
        </linearGradient>
        <linearGradient id="fillMobile" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
          <stop
            offset="55%"
            stopColor="var(--color-mobile)"
            stopOpacity={0.1}
          />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} />
      <ChartTooltip
        active
        content={<ChartTooltipContent className="dark:bg-muted" />}
        cursor={false}
      />
      <Area
        dataKey="mobile"
        fill="url(#fillMobile)"
        fillOpacity={0.1}
        stackId="a"
        stroke="var(--color-mobile)"
        strokeWidth={2}
        type="stepBefore"
      />
      <Area
        dataKey="desktop"
        fill="url(#fillDesktop)"
        fillOpacity={0.1}
        stackId="a"
        stroke="var(--color-desktop)"
        strokeWidth={2}
        type="stepBefore"
      />
    </AreaChart>
  </ChartContainer>
);
