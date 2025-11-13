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
exports.AlertDialog = AlertDialog;
exports.AlertDialogPortal = AlertDialogPortal;
exports.AlertDialogOverlay = AlertDialogOverlay;
exports.AlertDialogTrigger = AlertDialogTrigger;
exports.AlertDialogContent = AlertDialogContent;
exports.AlertDialogHeader = AlertDialogHeader;
exports.AlertDialogFooter = AlertDialogFooter;
exports.AlertDialogTitle = AlertDialogTitle;
exports.AlertDialogDescription = AlertDialogDescription;
exports.AlertDialogAction = AlertDialogAction;
exports.AlertDialogCancel = AlertDialogCancel;
var React = require("react");
var AlertDialogPrimitive = require("@radix-ui/react-alert-dialog");
var utils_1 = require("@astracms/ui/lib/utils");
var button_1 = require("@astracms/ui/components/button");
function AlertDialog(_a) {
    var props = __rest(_a, []);
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props}/>;
}
function AlertDialogTrigger(_a) {
    var props = __rest(_a, []);
    return (<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props}/>);
}
function AlertDialogPortal(_a) {
    var props = __rest(_a, []);
    return (<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props}/>);
}
function AlertDialogOverlay(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={(0, utils_1.cn)("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)} {...props}/>);
}
function AlertDialogContent(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content data-slot="alert-dialog-content" className={(0, utils_1.cn)("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-3xl border p-6 shadow-lg duration-200 sm:max-w-lg", className)} {...props}/>
    </AlertDialogPortal>);
}
function AlertDialogHeader(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div data-slot="alert-dialog-header" className={(0, utils_1.cn)("flex flex-col gap-2 text-center sm:text-left", className)} {...props}/>);
}
function AlertDialogFooter(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div data-slot="alert-dialog-footer" className={(0, utils_1.cn)("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props}/>);
}
function AlertDialogTitle(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={(0, utils_1.cn)("text-lg font-semibold", className)} {...props}/>);
}
function AlertDialogDescription(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={(0, utils_1.cn)("text-muted-foreground text-sm", className)} {...props}/>);
}
function AlertDialogAction(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AlertDialogPrimitive.Action className={(0, utils_1.cn)((0, button_1.buttonVariants)(), className)} {...props}/>);
}
function AlertDialogCancel(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<AlertDialogPrimitive.Cancel className={(0, utils_1.cn)((0, button_1.buttonVariants)({ variant: "outline" }), className)} {...props}/>);
}
