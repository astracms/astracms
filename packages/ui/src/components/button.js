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
exports.buttonVariants = void 0;
exports.Button = Button;
var utils_1 = require("../lib/utils");
var react_slot_1 = require("@radix-ui/react-slot");
var class_variance_authority_1 = require("class-variance-authority");
var buttonVariants = (0, class_variance_authority_1.cva)("inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-97 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 gap-1.5 rounded-lg px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
            icon: "size-8",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
exports.buttonVariants = buttonVariants;
function Button(_a) {
    var className = _a.className, variant = _a.variant, size = _a.size, _b = _a.asChild, asChild = _b === void 0 ? false : _b, props = __rest(_a, ["className", "variant", "size", "asChild"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    return (<Comp className={(0, utils_1.cn)(buttonVariants({ variant: variant, size: size, className: className }))} data-slot="button" {...props}/>);
}
