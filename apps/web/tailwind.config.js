"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var defaultTheme_1 = require("tailwindcss/defaultTheme");
exports.default = {
    theme: {
        extend: {
            fontFamily: {
                sans: __spreadArray(["var(--font-geist)"], defaultTheme_1.default.fontFamily.sans, true),
                serif: __spreadArray(["var(--font-literata)"], defaultTheme_1.default.fontFamily.serif, true),
            },
            typography: function () { return ({
                astracms: {
                    css: {
                        "--tw-prose-bold": "var(--foreground)",
                        "--tw-prose-counters": "var(--foreground)",
                        "--tw-prose-bullets": "var(--muted-foreground)",
                        "--tw-prose-quotes": "var(--foreground)",
                        "--tw-prose-quote-borders": "var(--border)",
                        "--tw-prose-captions": "var(--muted-foreground)",
                        "--tw-prose-code": "var(--foreground)",
                        "--tw-prose-code-bg": "var(--muted)",
                        "--tw-prose-pre-code": "var(--color-zinc-100)",
                        "--tw-prose-pre-bg": "var(--color-zinc-800)",
                        "--tw-prose-th-borders": "var(--border)",
                        "--tw-prose-td-borders": "var(--border)",
                        "code:not(pre code)": {
                            color: "var(--tw-prose-code)",
                            backgroundColor: "var(--tw-prose-code-bg)",
                            borderRadius: "0.375rem",
                            paddingInline: "0.275rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            display: "inline-block",
                        },
                    },
                },
                DEFAULT: {
                    css: {
                        a: {
                            "&:hover": {
                                color: "var(--accent)",
                            },
                        },
                    },
                },
            }); },
        },
    },
};
