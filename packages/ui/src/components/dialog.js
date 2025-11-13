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
exports.Dialog = Dialog;
exports.DialogClose = DialogClose;
exports.DialogContent = DialogContent;
exports.DialogDescription = DialogDescription;
exports.DialogFooter = DialogFooter;
exports.DialogHeader = DialogHeader;
exports.DialogOverlay = DialogOverlay;
exports.DialogPortal = DialogPortal;
exports.DialogTitle = DialogTitle;
exports.DialogTrigger = DialogTrigger;
exports.DialogX = DialogX;
var utils_1 = require("@astracms/ui/lib/utils");
var DialogPrimitive = require("@radix-ui/react-dialog");
var lucide_react_1 = require("lucide-react");
function Dialog(_a) {
    var props = __rest(_a, []);
    return <DialogPrimitive.Root data-slot="dialog" {...props}/>;
}
function DialogTrigger(_a) {
    var props = __rest(_a, []);
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props}/>;
}
function DialogPortal(_a) {
    var props = __rest(_a, []);
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props}/>;
}
function DialogClose(_a) {
    var props = __rest(_a, []);
    return <DialogPrimitive.Close data-slot="dialog-close" {...props}/>;
}
function DialogOverlay(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<DialogPrimitive.Overlay className={(0, utils_1.cn)("data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in", className)} data-slot="dialog-overlay" {...props}/>);
}
function DialogContent(_a) {
    var className = _a.className, children = _a.children, _b = _a.showCloseButton, showCloseButton = _b === void 0 ? false : _b, props = __rest(_a, ["className", "children", "showCloseButton"]);
    return (<DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content className={(0, utils_1.cn)("data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg", className)} data-slot="dialog-content" {...props}>
        {children}
        {showCloseButton && <DialogX />}
      </DialogPrimitive.Content>
    </DialogPortal>);
}
function DialogHeader(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("flex flex-col gap-2 text-center sm:text-left", className)} data-slot="dialog-header" {...props}/>);
}
function DialogFooter(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} data-slot="dialog-footer" {...props}/>);
}
function DialogTitle(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<DialogPrimitive.Title className={(0, utils_1.cn)("font-semibold text-lg leading-none", className)} data-slot="dialog-title" {...props}/>);
}
function DialogDescription(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<DialogPrimitive.Description className={(0, utils_1.cn)("text-muted-foreground text-sm", className)} data-slot="dialog-description" {...props}/>);
}
function DialogX(_a) {
    var className = _a.className, icon = _a.icon, props = __rest(_a, ["className", "icon"]);
    return (<DialogPrimitive.Close className={(0, utils_1.cn)("rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} data-slot="dialog-close" {...props}>
      {icon || <lucide_react_1.XIcon />}
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>);
}
