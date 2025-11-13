"use client";
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Calendar = Calendar;
exports.CalendarDayButton = CalendarDayButton;
var React = require("react");
var lucide_react_1 = require("lucide-react");
var react_day_picker_1 = require("react-day-picker");
var utils_1 = require("@astracms/ui/lib/utils");
var button_1 = require("@astracms/ui/components/button");
function Calendar(_a) {
    var className = _a.className, classNames = _a.classNames, _b = _a.showOutsideDays, showOutsideDays = _b === void 0 ? true : _b, _c = _a.captionLayout, captionLayout = _c === void 0 ? "label" : _c, _d = _a.buttonVariant, buttonVariant = _d === void 0 ? "ghost" : _d, formatters = _a.formatters, components = _a.components, props = __rest(_a, ["className", "classNames", "showOutsideDays", "captionLayout", "buttonVariant", "formatters", "components"]);
    var defaultClassNames = (0, react_day_picker_1.getDefaultClassNames)();
    return (<react_day_picker_1.DayPicker showOutsideDays={showOutsideDays} className={(0, utils_1.cn)("bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent", String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["rtl:**:[.rdp-button_next>svg]:rotate-180"], ["rtl:**:[.rdp-button\\_next>svg]:rotate-180"]))), String.raw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["rtl:**:[.rdp-button_previous>svg]:rotate-180"], ["rtl:**:[.rdp-button\\_previous>svg]:rotate-180"]))), className)} captionLayout={captionLayout} formatters={__assign({ formatMonthDropdown: function (date) {
                return date.toLocaleString("default", { month: "short" });
            } }, formatters)} classNames={__assign({ root: (0, utils_1.cn)("w-fit", defaultClassNames.root), months: (0, utils_1.cn)("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months), month: (0, utils_1.cn)("flex flex-col w-full gap-4", defaultClassNames.month), nav: (0, utils_1.cn)("flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between", defaultClassNames.nav), button_previous: (0, utils_1.cn)((0, button_1.buttonVariants)({ variant: buttonVariant }), "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_previous), button_next: (0, utils_1.cn)((0, button_1.buttonVariants)({ variant: buttonVariant }), "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_next), month_caption: (0, utils_1.cn)("flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)", defaultClassNames.month_caption), dropdowns: (0, utils_1.cn)("w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5", defaultClassNames.dropdowns), dropdown_root: (0, utils_1.cn)("relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md", defaultClassNames.dropdown_root), dropdown: (0, utils_1.cn)("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown), caption_label: (0, utils_1.cn)("select-none font-medium", captionLayout === "label"
                ? "text-sm"
                : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5", defaultClassNames.caption_label), table: "w-full border-collapse", weekdays: (0, utils_1.cn)("flex", defaultClassNames.weekdays), weekday: (0, utils_1.cn)("text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none", defaultClassNames.weekday), week: (0, utils_1.cn)("flex w-full mt-2", defaultClassNames.week), week_number_header: (0, utils_1.cn)("select-none w-(--cell-size)", defaultClassNames.week_number_header), week_number: (0, utils_1.cn)("text-[0.8rem] select-none text-muted-foreground", defaultClassNames.week_number), day: (0, utils_1.cn)("relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none", defaultClassNames.day), range_start: (0, utils_1.cn)("rounded-l-md bg-accent", defaultClassNames.range_start), range_middle: (0, utils_1.cn)("rounded-none", defaultClassNames.range_middle), range_end: (0, utils_1.cn)("rounded-r-md bg-accent", defaultClassNames.range_end), today: (0, utils_1.cn)("bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none", defaultClassNames.today), outside: (0, utils_1.cn)("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside), disabled: (0, utils_1.cn)("text-muted-foreground opacity-50", defaultClassNames.disabled), hidden: (0, utils_1.cn)("invisible", defaultClassNames.hidden) }, classNames)} components={__assign({ Root: function (_a) {
                var className = _a.className, rootRef = _a.rootRef, props = __rest(_a, ["className", "rootRef"]);
                return (<div data-slot="calendar" ref={rootRef} className={(0, utils_1.cn)(className)} {...props}/>);
            }, Chevron: function (_a) {
                var className = _a.className, orientation = _a.orientation, props = __rest(_a, ["className", "orientation"]);
                if (orientation === "left") {
                    return (<lucide_react_1.ChevronLeftIcon className={(0, utils_1.cn)("size-4", className)} {...props}/>);
                }
                if (orientation === "right") {
                    return (<lucide_react_1.ChevronRightIcon className={(0, utils_1.cn)("size-4", className)} {...props}/>);
                }
                return (<lucide_react_1.ChevronDownIcon className={(0, utils_1.cn)("size-4", className)} {...props}/>);
            }, DayButton: CalendarDayButton, WeekNumber: function (_a) {
                var children = _a.children, props = __rest(_a, ["children"]);
                return (<td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>);
            } }, components)} {...props}/>);
}
function CalendarDayButton(_a) {
    var className = _a.className, day = _a.day, modifiers = _a.modifiers, props = __rest(_a, ["className", "day", "modifiers"]);
    var defaultClassNames = (0, react_day_picker_1.getDefaultClassNames)();
    var ref = React.useRef(null);
    React.useEffect(function () {
        var _a;
        if (modifiers.focused)
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.focus();
    }, [modifiers.focused]);
    return (<button_1.Button ref={ref} variant="ghost" size="icon" data-day={day.date.toLocaleDateString()} data-selected-single={modifiers.selected &&
            !modifiers.range_start &&
            !modifiers.range_end &&
            !modifiers.range_middle} data-range-start={modifiers.range_start} data-range-end={modifiers.range_end} data-range-middle={modifiers.range_middle} className={(0, utils_1.cn)("data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70", defaultClassNames.day, className)} {...props}/>);
}
var templateObject_1, templateObject_2;
