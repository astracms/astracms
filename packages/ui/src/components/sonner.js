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
exports.toast = exports.Toaster = void 0;
var next_themes_1 = require("next-themes");
var sonner_1 = require("sonner");
Object.defineProperty(exports, "toast", { enumerable: true, get: function () { return sonner_1.toast; } });
var Toaster = function (_a) {
    var props = __rest(_a, []);
    var _b = (0, next_themes_1.useTheme)().theme, theme = _b === void 0 ? "system" : _b;
    return (<sonner_1.Toaster theme={theme} className="toaster group" style={{
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
        }} {...props}/>);
};
exports.Toaster = Toaster;
