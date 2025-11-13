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
exports.Progress = Progress;
var React = require("react");
var ProgressPrimitive = require("@radix-ui/react-progress");
var utils_1 = require("@astracms/ui/lib/utils");
function Progress(_a) {
    var className = _a.className, value = _a.value, props = __rest(_a, ["className", "value"]);
    return (<ProgressPrimitive.Root data-slot="progress" className={(0, utils_1.cn)("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)} {...props}>
      <ProgressPrimitive.Indicator data-slot="progress-indicator" className="bg-primary h-full w-full flex-1 transition-all" style={{ transform: "translateX(-".concat(100 - (value || 0), "%)") }}/>
    </ProgressPrimitive.Root>);
}
