"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasViewportWidthChanged = exports.isTouchDevice = exports.handleResize = exports.debounce = exports.setAccordionHeight = void 0;
var setAccordionHeight = function (accordions) {
    var originalStates = Array.from(accordions).map(function (accordion) { return accordion.open; });
    for (var _i = 0, accordions_1 = accordions; _i < accordions_1.length; _i++) {
        var accordion = accordions_1[_i];
        accordion.classList.remove("accordion-item--animated");
        resetAccordionHeight(accordion);
        assignHeight(accordion);
    }
    accordions.forEach(function (accordion, index) {
        accordion.open = originalStates[index];
        accordion.classList.add("accordion-item--animated");
    });
};
exports.setAccordionHeight = setAccordionHeight;
var resetAccordionHeight = function (accordion) {
    accordion.style.removeProperty("--accordion-item-expanded");
    accordion.style.removeProperty("--accordion-item-collapsed");
};
var assignHeight = function (accordion) {
    accordion.open = false;
    var collapsedHeight = accordion.offsetHeight;
    accordion.open = true;
    var expandedHeight = accordion.scrollHeight;
    accordion.style.setProperty("--accordion-item-expanded", "".concat(expandedHeight, "px"));
    accordion.style.setProperty("--accordion-item-collapsed", "".concat(collapsedHeight, "px"));
};
var debounce = function (callback, delay) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = window.setTimeout(function () { return callback.apply(void 0, args); }, delay);
    };
};
exports.debounce = debounce;
var handleResize = function (callback) {
    var debouncedCallback = (0, exports.debounce)(callback, 300);
    window.addEventListener("resize", debouncedCallback);
    return function () {
        window.removeEventListener("resize", debouncedCallback);
    };
};
exports.handleResize = handleResize;
var isTouchDevice = function () {
    return window.matchMedia("(pointer: coarse)").matches;
};
exports.isTouchDevice = isTouchDevice;
var lastWidth;
var hasViewportWidthChanged = function () {
    if (typeof window !== "undefined") {
        var currentWidth = window.innerWidth;
        var widthChanged = currentWidth !== lastWidth;
        if (widthChanged) {
            lastWidth = currentWidth;
        }
        return widthChanged;
    }
    return false;
};
exports.hasViewportWidthChanged = hasViewportWidthChanged;
