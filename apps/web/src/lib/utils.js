"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReadTime = calculateReadTime;
exports.cn = cn;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function calculateReadTime(content) {
    var wordsPerMinute = 200;
    var plainText = content.replace(/<[^>]*>/g, "").trim();
    var wordCount = plainText.split(/\s+/).length;
    var readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
}
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
