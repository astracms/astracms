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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
exports.SidebarContent = SidebarContent;
exports.SidebarFooter = SidebarFooter;
exports.SidebarGroup = SidebarGroup;
exports.SidebarGroupAction = SidebarGroupAction;
exports.SidebarGroupContent = SidebarGroupContent;
exports.SidebarGroupLabel = SidebarGroupLabel;
exports.SidebarHeader = SidebarHeader;
exports.SidebarInput = SidebarInput;
exports.SidebarInset = SidebarInset;
exports.SidebarMenu = SidebarMenu;
exports.SidebarMenuAction = SidebarMenuAction;
exports.SidebarMenuBadge = SidebarMenuBadge;
exports.SidebarMenuButton = SidebarMenuButton;
exports.SidebarMenuItem = SidebarMenuItem;
exports.SidebarMenuSkeleton = SidebarMenuSkeleton;
exports.SidebarMenuSub = SidebarMenuSub;
exports.SidebarMenuSubButton = SidebarMenuSubButton;
exports.SidebarMenuSubItem = SidebarMenuSubItem;
exports.SidebarProvider = SidebarProvider;
exports.SidebarRail = SidebarRail;
exports.SidebarSeparator = SidebarSeparator;
exports.SidebarTrigger = SidebarTrigger;
exports.useSidebar = useSidebar;
var button_1 = require("@astracms/ui/components/button");
var input_1 = require("@astracms/ui/components/input");
var separator_1 = require("@astracms/ui/components/separator");
var sheet_1 = require("@astracms/ui/components/sheet");
var skeleton_1 = require("@astracms/ui/components/skeleton");
var tooltip_1 = require("@astracms/ui/components/tooltip");
var use_mobile_1 = require("../hooks/use-mobile");
var utils_1 = require("../lib/utils");
var react_slot_1 = require("@radix-ui/react-slot");
var class_variance_authority_1 = require("class-variance-authority");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "k";
var SidebarContext = (0, react_1.createContext)(null);
function useSidebar() {
    var context = (0, react_1.useContext)(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }
    return context;
}
function SidebarProvider(_a) {
    var _b = _a.defaultOpen, defaultOpen = _b === void 0 ? true : _b, openProp = _a.open, setOpenProp = _a.onOpenChange, className = _a.className, style = _a.style, children = _a.children, props = __rest(_a, ["defaultOpen", "open", "onOpenChange", "className", "style", "children"]);
    var isMobile = (0, use_mobile_1.useIsMobile)();
    var _c = (0, react_1.useState)(false), openMobile = _c[0], setOpenMobile = _c[1];
    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    var _d = (0, react_1.useState)(defaultOpen), _open = _d[0], _setOpen = _d[1];
    var open = openProp !== null && openProp !== void 0 ? openProp : _open;
    var setOpen = (0, react_1.useCallback)(function (value) {
        var openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
            setOpenProp(openState);
        }
        else {
            _setOpen(openState);
        }
        // This sets the cookie to keep the sidebar state.
        // biome-ignore lint/suspicious/noDocumentCookie: <>
        document.cookie = "".concat(SIDEBAR_COOKIE_NAME, "=").concat(openState, "; path=/; max-age=").concat(SIDEBAR_COOKIE_MAX_AGE);
    }, [setOpenProp, open]);
    // Helper to toggle the sidebar.
    var toggleSidebar = (0, react_1.useCallback)(function () {
        return isMobile ? setOpenMobile(function (open) { return !open; }) : setOpen(function (open) { return !open; });
    }, [isMobile, setOpen, setOpenMobile]);
    // Adds a keyboard shortcut to toggle the sidebar.
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (event) {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    }, [toggleSidebar]);
    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    var state = open ? "expanded" : "collapsed";
    var contextValue = (0, react_1.useMemo)(function () { return ({
        state: state,
        open: open,
        setOpen: setOpen,
        isMobile: isMobile,
        openMobile: openMobile,
        setOpenMobile: setOpenMobile,
        toggleSidebar: toggleSidebar,
    }); }, [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]);
    return (<SidebarContext.Provider value={contextValue}>
      <tooltip_1.TooltipProvider delayDuration={0}>
        <div className={(0, utils_1.cn)("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar", className)} data-slot="sidebar-wrapper" style={__assign({ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON }, style)} {...props}>
          {children}
        </div>
      </tooltip_1.TooltipProvider>
    </SidebarContext.Provider>);
}
function Sidebar(_a) {
    var _b = _a.side, side = _b === void 0 ? "left" : _b, _c = _a.variant, variant = _c === void 0 ? "sidebar" : _c, _d = _a.collapsible, collapsible = _d === void 0 ? "offcanvas" : _d, className = _a.className, children = _a.children, props = __rest(_a, ["side", "variant", "collapsible", "className", "children"]);
    var _e = useSidebar(), isMobile = _e.isMobile, state = _e.state, openMobile = _e.openMobile, setOpenMobile = _e.setOpenMobile;
    if (collapsible === "none") {
        return (<div className={(0, utils_1.cn)("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className)} data-slot="sidebar" {...props}>
        {children}
      </div>);
    }
    if (isMobile) {
        return (<sheet_1.Sheet onOpenChange={setOpenMobile} open={openMobile} {...props}>
        <sheet_1.SheetContent className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" data-mobile="true" data-sidebar="sidebar" data-slot="sidebar" side={side} style={{
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            }}>
          <sheet_1.SheetHeader className="sr-only">
            <sheet_1.SheetTitle>Sidebar</sheet_1.SheetTitle>
            <sheet_1.SheetDescription>Displays the mobile sidebar.</sheet_1.SheetDescription>
          </sheet_1.SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </sheet_1.SheetContent>
      </sheet_1.Sheet>);
    }
    return (<div className="group peer hidden text-sidebar-foreground md:block" data-collapsible={state === "collapsed" ? collapsible : ""} data-side={side} data-slot="sidebar" data-state={state} data-variant={variant}>
      {/* This is what handles the sidebar gap on desktop */}
      <div className={(0, utils_1.cn)("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)")} data-slot="sidebar-gap"/>
      <div className={(0, utils_1.cn)("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", 
        // Adjust the padding for floating and inset variants.
        variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} data-slot="sidebar-container" {...props}>
        <div className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm" data-sidebar="sidebar" data-slot="sidebar-inner">
          {children}
        </div>
      </div>
    </div>);
}
function SidebarTrigger(_a) {
    var className = _a.className, onClick = _a.onClick, children = _a.children, props = __rest(_a, ["className", "onClick", "children"]);
    var toggleSidebar = useSidebar().toggleSidebar;
    return (<button_1.Button className={(0, utils_1.cn)("size-7", className)} data-sidebar="trigger" data-slot="sidebar-trigger" onClick={function (event) {
            onClick === null || onClick === void 0 ? void 0 : onClick(event);
            toggleSidebar();
        }} size="icon" variant="ghost" {...props}>
      {children || <lucide_react_1.PanelLeftIcon />}
      <span className="sr-only">Toggle Sidebar</span>
    </button_1.Button>);
}
function SidebarRail(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    var toggleSidebar = useSidebar().toggleSidebar;
    return (<button aria-label="Toggle Sidebar" className={(0, utils_1.cn)("-translate-x-1/2 group-data-[side=left]:-right-4 absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=right]:left-0 sm:flex", "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:after:left-full", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)} data-sidebar="rail" data-slot="sidebar-rail" onClick={toggleSidebar} tabIndex={-1} title="Toggle Sidebar" {...props}/>);
}
function SidebarInset(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<main className={(0, utils_1.cn)("relative flex w-full flex-1 flex-col bg-background", "md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm", className)} data-slot="sidebar-inset" {...props}/>);
}
function SidebarInput(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<input_1.Input className={(0, utils_1.cn)("h-8 w-full bg-background shadow-none", className)} data-sidebar="input" data-slot="sidebar-input" {...props}/>);
}
function SidebarHeader(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("flex flex-col gap-2 p-2", className)} data-sidebar="header" data-slot="sidebar-header" {...props}/>);
}
function SidebarFooter(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("flex flex-col gap-2 p-2", className)} data-sidebar="footer" data-slot="sidebar-footer" {...props}/>);
}
function SidebarSeparator(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<separator_1.Separator className={(0, utils_1.cn)("mx-2 w-auto bg-sidebar-border", className)} data-sidebar="separator" data-slot="sidebar-separator" {...props}/>);
}
function SidebarContent(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} data-sidebar="content" data-slot="sidebar-content" {...props}/>);
}
function SidebarGroup(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("relative flex w-full min-w-0 flex-col p-2", className)} data-sidebar="group" data-slot="sidebar-group" {...props}/>);
}
function SidebarGroupLabel(_a) {
    var className = _a.className, _b = _a.asChild, asChild = _b === void 0 ? false : _b, props = __rest(_a, ["className", "asChild"]);
    var Comp = asChild ? react_slot_1.Slot : "div";
    return (<Comp className={(0, utils_1.cn)("flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 text-xs outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} data-sidebar="group-label" data-slot="sidebar-group-label" {...props}/>);
}
function SidebarGroupAction(_a) {
    var className = _a.className, _b = _a.asChild, asChild = _b === void 0 ? false : _b, props = __rest(_a, ["className", "asChild"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    return (<Comp className={(0, utils_1.cn)("absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", 
        // Increases the hit area of the button on mobile.
        "after:-inset-2 after:absolute md:after:hidden", "group-data-[collapsible=icon]:hidden", className)} data-sidebar="group-action" data-slot="sidebar-group-action" {...props}/>);
}
function SidebarGroupContent(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("w-full text-sm", className)} data-sidebar="group-content" data-slot="sidebar-group-content" {...props}/>);
}
function SidebarMenu(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<ul className={(0, utils_1.cn)("flex w-full min-w-0 flex-col gap-1", className)} data-sidebar="menu" data-slot="sidebar-menu" {...props}/>);
}
function SidebarMenuItem(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<li className={(0, utils_1.cn)("group/menu-item relative", className)} data-sidebar="menu-item" data-slot="sidebar-menu-item" {...props}/>);
}
var sidebarMenuButtonVariants = (0, class_variance_authority_1.cva)("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
    variants: {
        variant: {
            default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        },
        size: {
            default: "h-8 text-sm",
            sm: "h-7 text-xs",
            lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
function SidebarMenuButton(_a) {
    var _b = _a.asChild, asChild = _b === void 0 ? false : _b, _c = _a.isActive, isActive = _c === void 0 ? false : _c, _d = _a.variant, variant = _d === void 0 ? "default" : _d, _e = _a.size, size = _e === void 0 ? "default" : _e, tooltip = _a.tooltip, className = _a.className, props = __rest(_a, ["asChild", "isActive", "variant", "size", "tooltip", "className"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    var _f = useSidebar(), isMobile = _f.isMobile, state = _f.state;
    var button = (<Comp className={(0, utils_1.cn)(sidebarMenuButtonVariants({ variant: variant, size: size }), className)} data-active={isActive} data-sidebar="menu-button" data-size={size} data-slot="sidebar-menu-button" {...props}/>);
    if (!tooltip) {
        return button;
    }
    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }
    return (<tooltip_1.Tooltip>
      <tooltip_1.TooltipTrigger asChild>{button}</tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent align="center" hidden={state !== "collapsed" || isMobile} side="right" {...tooltip}/>
    </tooltip_1.Tooltip>);
}
function SidebarMenuAction(_a) {
    var className = _a.className, _b = _a.asChild, asChild = _b === void 0 ? false : _b, _c = _a.showOnHover, showOnHover = _c === void 0 ? false : _c, props = __rest(_a, ["className", "asChild", "showOnHover"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    return (<Comp className={(0, utils_1.cn)("absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0", 
        // Increases the hit area of the button on mobile.
        "after:-inset-2 after:absolute md:after:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className)} data-sidebar="menu-action" data-slot="sidebar-menu-action" {...props}/>);
}
function SidebarMenuBadge(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 font-medium text-sidebar-foreground text-xs tabular-nums", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className)} data-sidebar="menu-badge" data-slot="sidebar-menu-badge" {...props}/>);
}
function SidebarMenuSkeleton(_a) {
    var className = _a.className, _b = _a.showIcon, showIcon = _b === void 0 ? false : _b, props = __rest(_a, ["className", "showIcon"]);
    // Random width between 50 to 90%.
    var width = (0, react_1.useMemo)(function () {
        return "".concat(Math.floor(Math.random() * 40) + 50, "%");
    }, []);
    return (<div className={(0, utils_1.cn)("flex h-8 items-center gap-2 rounded-md px-2", className)} data-sidebar="menu-skeleton" data-slot="sidebar-menu-skeleton" {...props}>
      {showIcon && (<skeleton_1.Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon"/>)}
      <skeleton_1.Skeleton className="h-4 max-w-(--skeleton-width) flex-1" data-sidebar="menu-skeleton-text" style={{
            "--skeleton-width": width,
        }}/>
    </div>);
}
function SidebarMenuSub(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<ul className={(0, utils_1.cn)("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-sidebar-border border-l px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)} data-sidebar="menu-sub" data-slot="sidebar-menu-sub" {...props}/>);
}
function SidebarMenuSubItem(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<li className={(0, utils_1.cn)("group/menu-sub-item relative", className)} data-sidebar="menu-sub-item" data-slot="sidebar-menu-sub-item" {...props}/>);
}
function SidebarMenuSubButton(_a) {
    var _b = _a.asChild, asChild = _b === void 0 ? false : _b, _c = _a.size, size = _c === void 0 ? "md" : _c, _d = _a.isActive, isActive = _d === void 0 ? false : _d, className = _a.className, props = __rest(_a, ["asChild", "size", "isActive", "className"]);
    var Comp = asChild ? react_slot_1.Slot : "a";
    return (<Comp className={(0, utils_1.cn)("-translate-x-px flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className)} data-active={isActive} data-sidebar="menu-sub-button" data-size={size} data-slot="sidebar-menu-sub-button" {...props}/>);
}
