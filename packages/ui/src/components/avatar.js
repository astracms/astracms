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
exports.Avatar = Avatar;
exports.AvatarImage = AvatarImage;
exports.AvatarFallback = AvatarFallback;
var React = require("react");
var AvatarPrimitive = require("@radix-ui/react-avatar");
var utils_1 = require("@astracms/ui/lib/utils");
function Avatar(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Root data-slot="avatar" className={(0, utils_1.cn)("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)} {...props}/>);
}
function AvatarImage(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Image data-slot="avatar-image" className={(0, utils_1.cn)("aspect-square size-full", className)} {...props}/>);
}
function AvatarFallback(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Fallback data-slot="avatar-fallback" className={(0, utils_1.cn)("bg-muted flex size-full items-center justify-center rounded-full", className)} {...props}/>);
}
