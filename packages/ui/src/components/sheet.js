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
exports.Sheet = Sheet;
exports.SheetTrigger = SheetTrigger;
exports.SheetClose = SheetClose;
exports.SheetContent = SheetContent;
exports.SheetHeader = SheetHeader;
exports.SheetFooter = SheetFooter;
exports.SheetTitle = SheetTitle;
exports.SheetDescription = SheetDescription;
exports.SheetX = SheetX;
var utils_1 = require("@astracms/ui/lib/utils");
var SheetPrimitive = require("@radix-ui/react-dialog");
var lucide_react_1 = require("lucide-react");
function Sheet(_a) {
    var props = __rest(_a, []);
    return <SheetPrimitive.Root data-slot="sheet" {...props}/>;
}
function SheetTrigger(_a) {
    var props = __rest(_a, []);
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props}/>;
}
function SheetClose(_a) {
    var props = __rest(_a, []);
    return <SheetPrimitive.Close data-slot="sheet-close" {...props}/>;
}
function SheetPortal(_a) {
    var props = __rest(_a, []);
    return <SheetPrimitive.Portal data-slot="sheet-portal" {...props}/>;
}
function SheetOverlay(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<SheetPrimitive.Overlay className={(0, utils_1.cn)("data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in", className)} data-slot="sheet-overlay" {...props}/>);
}
function SheetContent(_a) {
    var className = _a.className, children = _a.children, _b = _a.showCloseButton, showCloseButton = _b === void 0 ? false : _b, _c = _a.side, side = _c === void 0 ? "right" : _c, props = __rest(_a, ["className", "children", "showCloseButton", "side"]);
    return (<SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content className={(0, utils_1.cn)("fixed z-50 flex flex-col gap-4 rounded-3xl bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-300 data-[state=open]:duration-500", "top-[15px] bottom-[15px]", side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right right-[15px] w-3/4 sm:max-w-md", side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left left-[15px] w-3/4 sm:max-w-md", side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top top-[15px] right-[15px] bottom-auto left-[15px] h-auto", side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom top-auto right-[15px] bottom-[15px] left-[15px] h-auto", className)} data-slot="sheet-content" {...props}>
        {children}
        {showCloseButton && <SheetX />}
      </SheetPrimitive.Content>
    </SheetPortal>);
}
function SheetHeader(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("flex flex-col gap-1.5 p-4", className)} data-slot="sheet-header" {...props}/>);
}
function SheetFooter(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("mt-auto flex flex-col gap-2 p-4", className)} data-slot="sheet-footer" {...props}/>);
}
function SheetTitle(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<SheetPrimitive.Title className={(0, utils_1.cn)("font-semibold text-foreground", className)} data-slot="sheet-title" {...props}/>);
}
function SheetDescription(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<SheetPrimitive.Description className={(0, utils_1.cn)("text-muted-foreground text-sm", className)} data-slot="sheet-description" {...props}/>);
}
function SheetX(_a) {
    var className = _a.className, icon = _a.icon, props = __rest(_a, ["className", "icon"]);
    return (<SheetPrimitive.Close className={(0, utils_1.cn)("rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", className)} {...props}>
      {icon || <lucide_react_1.XIcon className="size-4"/>}
      <span className="sr-only">Close</span>
    </SheetPrimitive.Close>);
}
