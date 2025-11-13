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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.MarkdownToTiptapParser = void 0;
exports.markdownToTiptap = markdownToTiptap;
exports.markdownToHtml = markdownToHtml;
var marked_1 = require("marked");
var MarkdownToTiptapParser = /** @class */ (function () {
    function MarkdownToTiptapParser() {
        this.tokens = [];
        marked_1.marked.setOptions({ gfm: true, breaks: true });
    }
    MarkdownToTiptapParser.prototype.parse = function (markdown) {
        this.tokens = marked_1.marked.lexer(markdown);
        return { type: "doc", content: this.parseTokens(this.tokens) };
    };
    MarkdownToTiptapParser.prototype.parseTokens = function (tokens) {
        var content = [];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            var node = this.parseToken(token);
            if (node) {
                if (Array.isArray(node)) {
                    content.push.apply(content, node);
                }
                else {
                    content.push(node);
                }
            }
        }
        return content;
    };
    MarkdownToTiptapParser.prototype.parseToken = function (token) {
        switch (token.type) {
            case "heading":
                return MarkdownToTiptapParser.parseHeading(token);
            case "paragraph":
                return MarkdownToTiptapParser.parseParagraph(token);
            case "blockquote":
                return MarkdownToTiptapParser.parseBlockquote(token);
            case "list":
                return MarkdownToTiptapParser.parseList(token);
            case "code":
                return MarkdownToTiptapParser.parseCodeBlock(token);
            case "hr":
                return { type: "horizontalRule" };
            case "table":
                return MarkdownToTiptapParser.parseTable(token);
            case "html":
                return MarkdownToTiptapParser.parseHTML(token);
            case "space":
                return null;
            default:
                return null;
        }
    };
    MarkdownToTiptapParser.parseHeading = function (token) {
        return {
            type: "heading",
            attrs: { level: token.depth },
            content: MarkdownToTiptapParser.parseInlineTokens(token.tokens || []),
        };
    };
    MarkdownToTiptapParser.parseParagraph = function (token) {
        return {
            type: "paragraph",
            content: MarkdownToTiptapParser.parseInlineTokens(token.tokens || []),
        };
    };
    MarkdownToTiptapParser.parseBlockquote = function (token) {
        var parser = new MarkdownToTiptapParser();
        return {
            type: "blockquote",
            content: parser.parseTokens(token.tokens || []),
        };
    };
    MarkdownToTiptapParser.parseList = function (token) {
        var isTaskList = token.items.some(function (item) { return item.task; });
        var type = isTaskList
            ? "taskList"
            : token.ordered
                ? "orderedList"
                : "bulletList";
        var items = token.items.map(function (item) {
            return isTaskList
                ? MarkdownToTiptapParser.parseTaskListItem(item)
                : MarkdownToTiptapParser.parseListItem(item);
        });
        var result = {
            type: type,
            content: items,
        };
        if (!isTaskList &&
            token.ordered &&
            typeof token.start === "number" &&
            token.start !== 1) {
            result.attrs = { start: token.start };
        }
        return result;
    };
    MarkdownToTiptapParser.parseTaskListItem = function (item) {
        var base = MarkdownToTiptapParser.parseListItem(item);
        return {
            type: "taskItem",
            attrs: { checked: !!item.checked },
            content: base.content,
        };
    };
    MarkdownToTiptapParser.parseListItem = function (item) {
        var parser = new MarkdownToTiptapParser();
        var content = parser.parseTokens(item.tokens || []);
        // In tight lists, marked doesn't wrap content in paragraphs
        // If the content is empty but we have text, or if content exists without paragraph wrapping
        // Check if we need to wrap in a paragraph
        if (content.length > 0 &&
            content.every(function (node) {
                return node.type !== "paragraph" &&
                    node.type !== "codeBlock" &&
                    node.type !== "blockquote";
            })) {
            // Content exists but isn't block-level, wrap it in a paragraph
            content = [{ type: "paragraph", content: content }];
        }
        else if (content.length === 0 && item.text) {
            // Fallback: parse the text as markdown if tokens are empty
            var textTokens = marked_1.marked.lexer(item.text);
            content = parser.parseTokens(textTokens);
            if (content.length === 0 ||
                content.every(function (node) { return node.type !== "paragraph"; })) {
                // Still no paragraph, create one from the raw text
                content = [
                    { type: "paragraph", content: [{ type: "text", text: item.text }] },
                ];
            }
        }
        return {
            type: "listItem",
            content: content,
        };
    };
    MarkdownToTiptapParser.parseCodeBlock = function (token) {
        return {
            type: "codeBlock",
            attrs: { language: token.lang || null },
            content: [{ type: "text", text: token.text }],
        };
    };
    MarkdownToTiptapParser.parseTable = function (token) {
        var rows = [];
        var headerRow = {
            type: "tableRow",
            content: token.header.map(function (cell) { return ({
                type: "tableHeader",
                content: MarkdownToTiptapParser.parseInlineTokens(cell.tokens || []),
            }); }),
        };
        rows.push(headerRow);
        for (var _i = 0, _a = token.rows; _i < _a.length; _i++) {
            var row = _a[_i];
            rows.push({
                type: "tableRow",
                content: row.map(function (cell) { return ({
                    type: "tableCell",
                    content: MarkdownToTiptapParser.parseInlineTokens(cell.tokens || []),
                }); }),
            });
        }
        return { type: "table", content: rows };
    };
    MarkdownToTiptapParser.parseHTML = function (token) {
        var text = token.text;
        var imgMatch = text.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i);
        if (imgMatch) {
            return {
                type: "image",
                attrs: { src: imgMatch[1], alt: imgMatch[2] },
            };
        }
        return { type: "paragraph", content: [{ type: "text", text: text }] };
    };
    MarkdownToTiptapParser.parseInlineTokens = function (tokens) {
        var content = [];
        for (var _i = 0, tokens_2 = tokens; _i < tokens_2.length; _i++) {
            var token = tokens_2[_i];
            var nodes = MarkdownToTiptapParser.parseInlineToken(token);
            if (nodes) {
                if (Array.isArray(nodes)) {
                    content.push.apply(content, nodes);
                }
                else {
                    content.push(nodes);
                }
            }
        }
        return content;
    };
    MarkdownToTiptapParser.parseInlineToken = function (token) {
        switch (token.type) {
            case "text":
                return { type: "text", text: token.text };
            case "strong":
                return MarkdownToTiptapParser.parseStrong(token);
            case "em":
                return MarkdownToTiptapParser.parseEm(token);
            case "codespan":
                return MarkdownToTiptapParser.parseCodespan(token);
            case "del":
                return MarkdownToTiptapParser.parseDel(token);
            case "link":
                return MarkdownToTiptapParser.parseLink(token);
            case "image":
                return MarkdownToTiptapParser.parseImage(token);
            case "br":
                return { type: "hardBreak" };
            default:
                return null;
        }
    };
    MarkdownToTiptapParser.parseStrong = function (token) {
        var content = MarkdownToTiptapParser.parseInlineTokens(token.tokens || []);
        return content.map(function (node) { return (__assign(__assign({}, node), { marks: __spreadArray(__spreadArray([], (node.marks || []), true), [{ type: "bold" }], false) })); });
    };
    MarkdownToTiptapParser.parseEm = function (token) {
        var content = MarkdownToTiptapParser.parseInlineTokens(token.tokens || []);
        return content.map(function (node) { return (__assign(__assign({}, node), { marks: __spreadArray(__spreadArray([], (node.marks || []), true), [{ type: "italic" }], false) })); });
    };
    MarkdownToTiptapParser.parseCodespan = function (token) {
        return {
            type: "text",
            text: token.text,
            marks: [{ type: "code" }],
        };
    };
    MarkdownToTiptapParser.parseDel = function (token) {
        var content = MarkdownToTiptapParser.parseInlineTokens(token.tokens || []);
        return content.map(function (node) { return (__assign(__assign({}, node), { marks: __spreadArray(__spreadArray([], (node.marks || []), true), [{ type: "strike" }], false) })); });
    };
    MarkdownToTiptapParser.parseLink = function (token) {
        var content = MarkdownToTiptapParser.parseInlineTokens(token.tokens || []);
        return content.map(function (node) { return (__assign(__assign({}, node), { marks: __spreadArray(__spreadArray([], (node.marks || []), true), [
                { type: "link", attrs: { href: token.href, title: token.title } },
            ], false) })); });
    };
    MarkdownToTiptapParser.parseImage = function (token) {
        return {
            type: "image",
            attrs: { src: token.href, alt: token.text, title: token.title },
        };
    };
    return MarkdownToTiptapParser;
}());
exports.MarkdownToTiptapParser = MarkdownToTiptapParser;
function markdownToTiptap(markdown) {
    var parser = new MarkdownToTiptapParser();
    return parser.parse(markdown);
}
function markdownToHtml(markdown) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    marked_1.marked.setOptions({ gfm: true, breaks: true });
                    return [4 /*yield*/, (0, marked_1.marked)(markdown)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
