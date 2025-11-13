"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimatedHatchedPatternAreaChart = AnimatedHatchedPatternAreaChart;
var recharts_1 = require("recharts");
var card_1 = require("@astracms/components/ui/card");
var chart_1 = require("@astracms/components/ui/chart");
var badge_1 = require("@astracms/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var chartData = [
    { month: "January", desktop: 342, mobile: 245 },
    { month: "February", desktop: 876, mobile: 654 },
    { month: "March", desktop: 512, mobile: 387 },
    { month: "April", desktop: 629, mobile: 521 },
    { month: "May", desktop: 458, mobile: 412 },
    { month: "June", desktop: 781, mobile: 598 },
    { month: "July", desktop: 394, mobile: 312 },
    { month: "August", desktop: 925, mobile: 743 },
    { month: "September", desktop: 647, mobile: 489 },
    { month: "October", desktop: 532, mobile: 476 },
    { month: "November", desktop: 803, mobile: 687 },
    { month: "December", desktop: 271, mobile: 198 },
];
var chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
};
function AnimatedHatchedPatternAreaChart() {
    var _a = react_1.default.useState(null), activeProperty = _a[0], setActiveProperty = _a[1];
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>
          Hatched Area Chart
          <badge_1.Badge variant="outline" className="text-green-500 bg-green-500/10 border-none ml-2">
            <lucide_react_1.TrendingUp className="h-4 w-4"/>
            <span>5.2%</span>
          </badge_1.Badge>
        </card_1.CardTitle>
        <card_1.CardDescription>
          Showing total visitors for the last 6 months
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <chart_1.ChartContainer config={chartConfig}>
          <recharts_1.AreaChart accessibilityLayer data={chartData}>
            <recharts_1.CartesianGrid vertical={false} strokeDasharray="3 3"/>
            <recharts_1.XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={function (value) { return value.slice(0, 3); }}/>
            <chart_1.ChartTooltip cursor={false} content={<chart_1.ChartTooltipContent />}/>
            <defs>
              <HatchedBackgroundPattern config={chartConfig}/>
              <linearGradient id="hatched-background-pattern-grad-desktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="hatched-background-pattern-grad-mobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <recharts_1.Area onMouseEnter={function () { return setActiveProperty("mobile"); }} onMouseLeave={function () { return setActiveProperty(null); }} dataKey="mobile" type="natural" fill={activeProperty === "mobile"
            ? "url(#hatched-background-pattern-mobile)"
            : "url(#hatched-background-pattern-grad-mobile)"} fillOpacity={0.4} stroke="var(--color-mobile)" stackId="a" strokeWidth={0.8}/>
            <recharts_1.Area onMouseEnter={function () { return setActiveProperty("desktop"); }} onMouseLeave={function () { return setActiveProperty(null); }} dataKey="desktop" type="natural" fill={activeProperty === "desktop"
            ? "url(#hatched-background-pattern-desktop)"
            : "url(#hatched-background-pattern-grad-desktop)"} fillOpacity={0.4} stroke="var(--color-desktop)" stackId="a" strokeWidth={0.8}/>
          </recharts_1.AreaChart>
        </chart_1.ChartContainer>
      </card_1.CardContent>
    </card_1.Card>);
}
var HatchedBackgroundPattern = function (_a) {
    var config = _a.config;
    var items = Object.fromEntries(Object.entries(config).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, value.color];
    }));
    return (<>
      {Object.entries(items).map(function (_a) {
            var key = _a[0], value = _a[1];
            return (<pattern key={key} id={"hatched-background-pattern-".concat(key)} x="0" y="0" width="6.81" height="6.81" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)" overflow="visible">
          <g overflow="visible" className="will-change-transform">
            <animateTransform attributeName="transform" type="translate" from="0 0" to="6 0" dur="1s" repeatCount="indefinite"/>
            <rect width="10" height="10" opacity={0.05} fill={value}/>
            <rect width="1" height="10" fill={value}/>
          </g>
        </pattern>);
        })}
    </>);
};
