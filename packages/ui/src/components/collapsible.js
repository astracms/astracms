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
exports.Collapsible = Collapsible;
exports.CollapsibleTrigger = CollapsibleTrigger;
exports.CollapsibleContent = CollapsibleContent;
var CollapsiblePrimitive = require("@radix-ui/react-collapsible");
function Collapsible(_a) {
    var props = __rest(_a, []);
    return <CollapsiblePrimitive.Root data-slot="collapsible" {...props}/>;
}
function CollapsibleTrigger(_a) {
    var props = __rest(_a, []);
    return (<CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props}/>);
}
function CollapsibleContent(_a) {
    var props = __rest(_a, []);
    return (<CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props}/>);
}
