"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPosts = fetchPosts;
exports.fetchCategories = fetchCategories;
var server_1 = require("astro:env/server");
var key = (0, server_1.getSecret)("ASTRACMS_WORKSPACE_KEY");
var url = (0, server_1.getSecret)("ASTRACMS_API_URL");
function fetchPosts() {
    return __awaiter(this, arguments, void 0, function (queryParams) {
        var fullUrl, response, data, error_1;
        if (queryParams === void 0) { queryParams = ""; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (import.meta.env.SKIP_API_FETCH_ON_BUILD) {
                        return [2 /*return*/, {
                                posts: [],
                                pagination: {
                                    limit: 0,
                                    currentPage: 1,
                                    nextPage: null,
                                    previousPage: null,
                                    totalPages: 0,
                                    totalItems: 0,
                                },
                            }];
                    }
                    fullUrl = "".concat(url, "/").concat(key, "/posts").concat(queryParams);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(fullUrl)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Failed to fetch posts from ".concat(fullUrl, ":"), {
                            status: response.status,
                            statusText: response.statusText,
                            url: fullUrl,
                        });
                        return [2 /*return*/, {
                                posts: [],
                                pagination: {
                                    limit: 0,
                                    currentPage: 1,
                                    nextPage: null,
                                    previousPage: null,
                                    totalPages: 0,
                                    totalItems: 0,
                                },
                            }];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, data];
                case 4:
                    error_1 = _a.sent();
                    console.log("Error fetching posts from ".concat(fullUrl, ":"), error_1);
                    return [2 /*return*/, {
                            posts: [],
                            pagination: {
                                limit: 0,
                                currentPage: 1,
                                nextPage: null,
                                previousPage: null,
                                totalPages: 0,
                                totalItems: 0,
                            },
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function fetchCategories() {
    return __awaiter(this, arguments, void 0, function (queryParams) {
        var fullUrl, response, data, error_2;
        if (queryParams === void 0) { queryParams = ""; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (import.meta.env.SKIP_API_FETCH_ON_BUILD) {
                        return [2 /*return*/, { categories: [] }];
                    }
                    fullUrl = "".concat(url, "/").concat(key, "/categories").concat(queryParams);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(fullUrl)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Failed to fetch categories from ".concat(fullUrl, ":"), {
                            status: response.status,
                            statusText: response.statusText,
                            url: fullUrl,
                        });
                        return [2 /*return*/, { categories: [] }];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, data];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error fetching categories from ".concat(fullUrl, ":"), error_2);
                    return [2 /*return*/, { categories: [] }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
