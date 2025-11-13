"use client";
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = Tabs;
exports.TabsList = TabsList;
exports.TabsTrigger = TabsTrigger;
exports.TabsContent = TabsContent;
var React = require("react");
var TabsPrimitive = require("@radix-ui/react-tabs");
var utils_1 = require("../lib/utils");
function Tabs(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.Root data-slot="tabs" className={(0, utils_1.cn)("flex flex-col gap-2", className)} {...props}/>);
}
var TabsListContext = React.createContext({
    variant: "default"
});
function TabsList(_a) {
    var className = _a.className, _b = _a.variant, variant = _b === void 0 ? "default" : _b, props = __rest(_a, ["className", "variant"]);
    return (<TabsListContext.Provider value={{ variant: variant }}>
      <TabsPrimitive.List data-slot="tabs-list" className={(0, utils_1.cn)("inline-flex items-center justify-center", variant === "default" && "bg-muted text-muted-foreground h-9 w-fit rounded-lg p-[3px]", variant === "line" && "h-10 border-b border-border", className)} {...props}/>
    </TabsListContext.Provider>);
}
function TabsTrigger(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    var variant = React.useContext(TabsListContext).variant;
    return (<TabsPrimitive.Trigger data-slot="tabs-trigger" className={(0, utils_1.cn)("inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", variant === "default" && "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground h-[calc(100%-1px)] flex-1 gap-1.5 rounded-md border border-transparent px-2 py-1 transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", variant === "line" && "px-4 py-2 -mb-px border-transparent hover:bg-muted border-b-2 data-[state=active]:text-primary data-[state=active]:border-primary", className)} {...props}/>);
}
function TabsContent(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.Content data-slot="tabs-content" className={(0, utils_1.cn)("flex-1 outline-none", className)} {...props}/>);
}
