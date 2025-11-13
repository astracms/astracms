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
exports.Table = Table;
exports.TableHeader = TableHeader;
exports.TableBody = TableBody;
exports.TableFooter = TableFooter;
exports.TableHead = TableHead;
exports.TableRow = TableRow;
exports.TableCell = TableCell;
exports.TableCaption = TableCaption;
var React = require("react");
var utils_1 = require("@astracms/ui/lib/utils");
function Table(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={(0, utils_1.cn)("w-full caption-bottom text-sm", className)} {...props}/>
    </div>);
}
function TableHeader(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<thead data-slot="table-header" className={(0, utils_1.cn)("[&_tr]:border-b", className)} {...props}/>);
}
function TableBody(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<tbody data-slot="table-body" className={(0, utils_1.cn)("[&_tr:last-child]:border-0", className)} {...props}/>);
}
function TableFooter(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<tfoot data-slot="table-footer" className={(0, utils_1.cn)("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)} {...props}/>);
}
function TableRow(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<tr data-slot="table-row" className={(0, utils_1.cn)("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)} {...props}/>);
}
function TableHead(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<th data-slot="table-head" className={(0, utils_1.cn)("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props}/>);
}
function TableCell(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<td data-slot="table-cell" className={(0, utils_1.cn)("p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props}/>);
}
function TableCaption(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<caption data-slot="table-caption" className={(0, utils_1.cn)("text-muted-foreground mt-4 text-sm", className)} {...props}/>);
}
