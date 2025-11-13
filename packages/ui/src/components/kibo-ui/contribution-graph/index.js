"use client";
"use strict";
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
exports.ContributionGraphLegend = exports.ContributionGraphTotalCount = exports.ContributionGraphFooter = exports.ContributionGraphCalendar = exports.ContributionGraphBlock = exports.ContributionGraph = void 0;
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var utils_1 = require("@astracms/ui/lib/utils");
var DEFAULT_MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
var DEFAULT_LABELS = {
    months: DEFAULT_MONTH_LABELS,
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    totalCount: "{{count}} activities in {{year}}",
    legend: {
        less: "Less",
        more: "More",
    },
};
var ContributionGraphContext = (0, react_1.createContext)(null);
var useContributionGraph = function () {
    var context = (0, react_1.useContext)(ContributionGraphContext);
    if (!context) {
        throw new Error("ContributionGraph components must be used within a ContributionGraph");
    }
    return context;
};
var fillHoles = function (activities) {
    if (activities.length === 0) {
        return [];
    }
    // Sort activities by date to ensure correct date range
    var sortedActivities = __spreadArray([], activities, true).sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });
    var calendar = new Map(activities.map(function (a) { return [a.date, a]; }));
    var firstActivity = sortedActivities[0];
    var lastActivity = sortedActivities.at(-1);
    if (!lastActivity) {
        return [];
    }
    return (0, date_fns_1.eachDayOfInterval)({
        start: (0, date_fns_1.parseISO)(firstActivity.date),
        end: (0, date_fns_1.parseISO)(lastActivity.date),
    }).map(function (day) {
        var date = (0, date_fns_1.formatISO)(day, { representation: "date" });
        if (calendar.has(date)) {
            return calendar.get(date);
        }
        return {
            date: date,
            count: 0,
            level: 0,
        };
    });
};
var groupByWeeks = function (activities, weekStart) {
    if (weekStart === void 0) { weekStart = 0; }
    if (activities.length === 0) {
        return [];
    }
    var normalizedActivities = fillHoles(activities);
    var firstActivity = normalizedActivities[0];
    var firstDate = (0, date_fns_1.parseISO)(firstActivity.date);
    var firstCalendarDate = (0, date_fns_1.getDay)(firstDate) === weekStart
        ? firstDate
        : (0, date_fns_1.subWeeks)((0, date_fns_1.nextDay)(firstDate, weekStart), 1);
    var paddedActivities = __spreadArray(__spreadArray([], new Array((0, date_fns_1.differenceInCalendarDays)(firstDate, firstCalendarDate)).fill(undefined), true), normalizedActivities, true);
    var numberOfWeeks = Math.ceil(paddedActivities.length / 7);
    return new Array(numberOfWeeks)
        .fill(undefined)
        .map(function (_, weekIndex) {
        return paddedActivities.slice(weekIndex * 7, weekIndex * 7 + 7);
    });
};
var getMonthLabels = function (weeks, monthNames) {
    if (monthNames === void 0) { monthNames = DEFAULT_MONTH_LABELS; }
    return weeks
        .reduce(function (labels, week, weekIndex) {
        var firstActivity = week.find(function (activity) { return activity !== undefined; });
        if (!firstActivity) {
            throw new Error("Unexpected error: Week ".concat(weekIndex + 1, " is empty: [").concat(week, "]."));
        }
        var month = monthNames[(0, date_fns_1.getMonth)((0, date_fns_1.parseISO)(firstActivity.date))];
        if (!month) {
            var monthName = new Date(firstActivity.date).toLocaleString("en-US", {
                month: "short",
            });
            throw new Error("Unexpected error: undefined month label for ".concat(monthName, "."));
        }
        var prevLabel = labels.at(-1);
        if (weekIndex === 0 || !prevLabel || prevLabel.label !== month) {
            return labels.concat({ weekIndex: weekIndex, label: month });
        }
        return labels;
    }, [])
        .filter(function (_a, index, labels) {
        var weekIndex = _a.weekIndex;
        var minWeeks = 3;
        if (index === 0) {
            return labels[1] && labels[1].weekIndex - weekIndex >= minWeeks;
        }
        if (index === labels.length - 1) {
            return weeks.slice(weekIndex).length >= minWeeks;
        }
        return true;
    });
};
var ContributionGraph = function (_a) {
    var data = _a.data, _b = _a.blockMargin, blockMargin = _b === void 0 ? 4 : _b, _c = _a.blockRadius, blockRadius = _c === void 0 ? 2 : _c, _d = _a.blockSize, blockSize = _d === void 0 ? 12 : _d, _e = _a.fontSize, fontSize = _e === void 0 ? 14 : _e, _f = _a.labels, labelsProp = _f === void 0 ? undefined : _f, _g = _a.maxLevel, maxLevelProp = _g === void 0 ? 4 : _g, _h = _a.style, style = _h === void 0 ? {} : _h, _j = _a.totalCount, totalCountProp = _j === void 0 ? undefined : _j, _k = _a.weekStart, weekStart = _k === void 0 ? 0 : _k, className = _a.className, props = __rest(_a, ["data", "blockMargin", "blockRadius", "blockSize", "fontSize", "labels", "maxLevel", "style", "totalCount", "weekStart", "className"]);
    var maxLevel = Math.max(1, maxLevelProp);
    var weeks = (0, react_1.useMemo)(function () { return groupByWeeks(data, weekStart); }, [data, weekStart]);
    var LABEL_MARGIN = 8;
    var labels = __assign(__assign({}, DEFAULT_LABELS), labelsProp);
    var labelHeight = fontSize + LABEL_MARGIN;
    var year = data && data.length > 0 && data[0] && data[0].date
        ? (0, date_fns_1.getYear)((0, date_fns_1.parseISO)(data[0].date))
        : new Date().getFullYear();
    var totalCount = typeof totalCountProp === "number"
        ? totalCountProp
        : data.reduce(function (sum, activity) { return sum + activity.count; }, 0);
    var width = weeks.length * (blockSize + blockMargin) - blockMargin;
    var height = labelHeight + (blockSize + blockMargin) * 7 - blockMargin;
    if (data.length === 0) {
        return null;
    }
    return (<ContributionGraphContext.Provider value={{
            data: data,
            weeks: weeks,
            blockMargin: blockMargin,
            blockRadius: blockRadius,
            blockSize: blockSize,
            fontSize: fontSize,
            labels: labels,
            labelHeight: labelHeight,
            maxLevel: maxLevel,
            totalCount: totalCount,
            weekStart: weekStart,
            year: year,
            width: width,
            height: height,
        }}>
      <div className={(0, utils_1.cn)("flex w-max max-w-full flex-col gap-2", className)} style={__assign({ fontSize: fontSize }, style)} {...props}/>
    </ContributionGraphContext.Provider>);
};
exports.ContributionGraph = ContributionGraph;
var ContributionGraphBlock = function (_a) {
    var activity = _a.activity, dayIndex = _a.dayIndex, weekIndex = _a.weekIndex, className = _a.className, props = __rest(_a, ["activity", "dayIndex", "weekIndex", "className"]);
    var _b = useContributionGraph(), blockSize = _b.blockSize, blockMargin = _b.blockMargin, blockRadius = _b.blockRadius, labelHeight = _b.labelHeight, maxLevel = _b.maxLevel;
    if (activity.level < 0 || activity.level > maxLevel) {
        throw new RangeError("Provided activity level ".concat(activity.level, " for ").concat(activity.date, " is out of range. It must be between 0 and ").concat(maxLevel, "."));
    }
    return (<rect className={(0, utils_1.cn)('data-[level="0"]:fill-muted', 'data-[level="1"]:fill-muted-foreground/20', 'data-[level="2"]:fill-muted-foreground/40', 'data-[level="3"]:fill-muted-foreground/60', 'data-[level="4"]:fill-muted-foreground/80', className)} data-count={activity.count} data-date={activity.date} data-level={activity.level} height={blockSize} rx={blockRadius} ry={blockRadius} width={blockSize} x={(blockSize + blockMargin) * weekIndex} y={labelHeight + (blockSize + blockMargin) * dayIndex} {...props}/>);
};
exports.ContributionGraphBlock = ContributionGraphBlock;
var ContributionGraphCalendar = function (_a) {
    var _b = _a.hideMonthLabels, hideMonthLabels = _b === void 0 ? false : _b, className = _a.className, children = _a.children, props = __rest(_a, ["hideMonthLabels", "className", "children"]);
    var _c = useContributionGraph(), weeks = _c.weeks, width = _c.width, height = _c.height, blockSize = _c.blockSize, blockMargin = _c.blockMargin, labels = _c.labels;
    var monthLabels = (0, react_1.useMemo)(function () { return getMonthLabels(weeks, labels.months); }, [weeks, labels.months]);
    return (<div className={(0, utils_1.cn)("max-w-full overflow-x-auto overflow-y-hidden", className)} {...props}>
      <svg className="block overflow-visible" height={height} viewBox={"0 0 ".concat(width, " ").concat(height)} width={width}>
        <title>Contribution Graph</title>
        {!hideMonthLabels && (<g className="fill-current">
            {monthLabels.map(function (_a) {
                var label = _a.label, weekIndex = _a.weekIndex;
                return (<text dominantBaseline="hanging" key={weekIndex} x={(blockSize + blockMargin) * weekIndex}>
                {label}
              </text>);
            })}
          </g>)}
        {weeks.map(function (week, weekIndex) {
            return week.map(function (activity, dayIndex) {
                if (!activity) {
                    return null;
                }
                return (<react_1.Fragment key={"".concat(weekIndex, "-").concat(dayIndex)}>
                {children({ activity: activity, dayIndex: dayIndex, weekIndex: weekIndex })}
              </react_1.Fragment>);
            });
        })}
      </svg>
    </div>);
};
exports.ContributionGraphCalendar = ContributionGraphCalendar;
var ContributionGraphFooter = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("flex flex-wrap gap-1 whitespace-nowrap sm:gap-x-4", className)} {...props}/>);
};
exports.ContributionGraphFooter = ContributionGraphFooter;
var ContributionGraphTotalCount = function (_a) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    var _b = useContributionGraph(), totalCount = _b.totalCount, year = _b.year, labels = _b.labels;
    if (children) {
        return <>{children({ totalCount: totalCount, year: year })}</>;
    }
    return (<div className={(0, utils_1.cn)("text-muted-foreground", className)} {...props}>
      {labels.totalCount
            ? labels.totalCount
                .replace("{{count}}", String(totalCount))
                .replace("{{year}}", String(year))
            : "".concat(totalCount, " activities in ").concat(year)}
    </div>);
};
exports.ContributionGraphTotalCount = ContributionGraphTotalCount;
var ContributionGraphLegend = function (_a) {
    var _b, _c;
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    var _d = useContributionGraph(), labels = _d.labels, maxLevel = _d.maxLevel, blockSize = _d.blockSize, blockRadius = _d.blockRadius;
    return (<div className={(0, utils_1.cn)("ml-auto flex items-center gap-[3px]", className)} {...props}>
      <span className="mr-1 text-muted-foreground">
        {((_b = labels.legend) === null || _b === void 0 ? void 0 : _b.less) || "Less"}
      </span>
      {new Array(maxLevel + 1).fill(undefined).map(function (_, level) {
            return children ? (<react_1.Fragment key={level}>{children({ level: level })}</react_1.Fragment>) : (<svg height={blockSize} key={level} width={blockSize}>
            <title>{"".concat(level, " contributions")}</title>
            <rect className={(0, utils_1.cn)("stroke-[1px] stroke-border", 'data-[level="0"]:fill-muted', 'data-[level="1"]:fill-muted-foreground/20', 'data-[level="2"]:fill-muted-foreground/40', 'data-[level="3"]:fill-muted-foreground/60', 'data-[level="4"]:fill-muted-foreground/80')} data-level={level} height={blockSize} rx={blockRadius} ry={blockRadius} width={blockSize}/>
          </svg>);
        })}
      <span className="ml-1 text-muted-foreground">
        {((_c = labels.legend) === null || _c === void 0 ? void 0 : _c.more) || "More"}
      </span>
    </div>);
};
exports.ContributionGraphLegend = ContributionGraphLegend;
