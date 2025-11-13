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
exports.Cropper = exports.ImageCropReset = exports.ImageCropApply = exports.ImageCropContent = exports.ImageCrop = void 0;
var button_1 = require("@astracms/ui/components/button");
var utils_1 = require("@astracms/ui/lib/utils");
var lucide_react_1 = require("lucide-react");
var radix_ui_1 = require("radix-ui");
var react_1 = require("react");
var react_image_crop_1 = require("react-image-crop");
require("react-image-crop/dist/ReactCrop.css");
var centerAspectCrop = function (mediaWidth, mediaHeight, aspect) {
    return (0, react_image_crop_1.centerCrop)(aspect
        ? (0, react_image_crop_1.makeAspectCrop)({
            unit: "%",
            width: 90,
        }, aspect, mediaWidth, mediaHeight)
        : { x: 0, y: 0, width: 90, height: 90, unit: "%" }, mediaWidth, mediaHeight);
};
var getCroppedPngImage = function (imageSrc, scaleFactor, pixelCrop, maxImageSize) { return __awaiter(void 0, void 0, void 0, function () {
    var canvas, ctx, scaleX, scaleY, croppedImageUrl, response, blob;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                canvas = document.createElement("canvas");
                ctx = canvas.getContext("2d");
                if (!ctx) {
                    throw new Error("Context is null, this should never happen.");
                }
                scaleX = imageSrc.naturalWidth / imageSrc.width;
                scaleY = imageSrc.naturalHeight / imageSrc.height;
                ctx.imageSmoothingEnabled = false;
                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;
                ctx.drawImage(imageSrc, pixelCrop.x * scaleX, pixelCrop.y * scaleY, pixelCrop.width * scaleX, pixelCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
                croppedImageUrl = canvas.toDataURL("image/png");
                return [4 /*yield*/, fetch(croppedImageUrl)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.blob()];
            case 2:
                blob = _a.sent();
                if (!(blob.size > maxImageSize)) return [3 /*break*/, 4];
                return [4 /*yield*/, getCroppedPngImage(imageSrc, scaleFactor * 0.9, pixelCrop, maxImageSize)];
            case 3: return [2 /*return*/, _a.sent()];
            case 4: return [2 /*return*/, croppedImageUrl];
        }
    });
}); };
var ImageCropContext = (0, react_1.createContext)(null);
var useImageCrop = function () {
    var context = (0, react_1.useContext)(ImageCropContext);
    if (!context) {
        throw new Error("ImageCrop components must be used within ImageCrop");
    }
    return context;
};
var ImageCrop = function (_a) {
    var file = _a.file, _b = _a.maxImageSize, maxImageSize = _b === void 0 ? 1024 * 1024 * 5 : _b, onCrop = _a.onCrop, children = _a.children, onChange = _a.onChange, onComplete = _a.onComplete, reactCropProps = __rest(_a, ["file", "maxImageSize", "onCrop", "children", "onChange", "onComplete"]);
    var imgRef = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)(""), imgSrc = _c[0], setImgSrc = _c[1];
    var _d = (0, react_1.useState)(), crop = _d[0], setCrop = _d[1];
    var _e = (0, react_1.useState)(null), completedCrop = _e[0], setCompletedCrop = _e[1];
    var _f = (0, react_1.useState)(), initialCrop = _f[0], setInitialCrop = _f[1];
    (0, react_1.useEffect)(function () {
        var reader = new FileReader();
        reader.addEventListener("load", function () { var _a; return setImgSrc(((_a = reader.result) === null || _a === void 0 ? void 0 : _a.toString()) || ""); });
        reader.readAsDataURL(file);
    }, [file]);
    var onImageLoad = (0, react_1.useCallback)(function (e) {
        var _a = e.currentTarget, width = _a.width, height = _a.height;
        var newCrop = centerAspectCrop(width, height, reactCropProps.aspect);
        setCrop(newCrop);
        setInitialCrop(newCrop);
    }, [reactCropProps.aspect]);
    var handleChange = function (pixelCrop, percentCrop) {
        setCrop(percentCrop);
        onChange === null || onChange === void 0 ? void 0 : onChange(pixelCrop, percentCrop);
    };
    // biome-ignore lint/suspicious/useAwait: "onComplete is async"
    var handleComplete = function (pixelCrop, percentCrop) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setCompletedCrop(pixelCrop);
            onComplete === null || onComplete === void 0 ? void 0 : onComplete(pixelCrop, percentCrop);
            return [2 /*return*/];
        });
    }); };
    var applyCrop = function () { return __awaiter(void 0, void 0, void 0, function () {
        var croppedImage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(imgRef.current && completedCrop)) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getCroppedPngImage(imgRef.current, 1, completedCrop, maxImageSize)];
                case 1:
                    croppedImage = _a.sent();
                    onCrop === null || onCrop === void 0 ? void 0 : onCrop(croppedImage);
                    return [2 /*return*/];
            }
        });
    }); };
    var resetCrop = function () {
        if (initialCrop) {
            setCrop(initialCrop);
            setCompletedCrop(null);
        }
    };
    var contextValue = {
        file: file,
        maxImageSize: maxImageSize,
        imgSrc: imgSrc,
        crop: crop,
        completedCrop: completedCrop,
        imgRef: imgRef,
        onCrop: onCrop,
        reactCropProps: reactCropProps,
        handleChange: handleChange,
        handleComplete: handleComplete,
        onImageLoad: onImageLoad,
        applyCrop: applyCrop,
        resetCrop: resetCrop,
    };
    return (<ImageCropContext.Provider value={contextValue}>
      {children}
    </ImageCropContext.Provider>);
};
exports.ImageCrop = ImageCrop;
var ImageCropContent = function (_a) {
    var style = _a.style, className = _a.className;
    var _b = useImageCrop(), imgSrc = _b.imgSrc, crop = _b.crop, handleChange = _b.handleChange, handleComplete = _b.handleComplete, onImageLoad = _b.onImageLoad, imgRef = _b.imgRef, reactCropProps = _b.reactCropProps;
    var shadcnStyle = {
        "--rc-border-color": "var(--color-border)",
        "--rc-focus-color": "var(--color-primary)",
    };
    return (<react_image_crop_1.default className={(0, utils_1.cn)("max-h-[277px] max-w-full", className)} crop={crop} onChange={handleChange} onComplete={handleComplete} style={__assign(__assign({}, shadcnStyle), style)} {...reactCropProps}>
      {imgSrc && (<img alt="crop" className="size-full" onLoad={onImageLoad} ref={imgRef} src={imgSrc}/>)}
    </react_image_crop_1.default>);
};
exports.ImageCropContent = ImageCropContent;
var ImageCropApply = function (_a) {
    var _b = _a.asChild, asChild = _b === void 0 ? false : _b, children = _a.children, onClick = _a.onClick, props = __rest(_a, ["asChild", "children", "onClick"]);
    var applyCrop = useImageCrop().applyCrop;
    var handleClick = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, applyCrop()];
                case 1:
                    _a.sent();
                    onClick === null || onClick === void 0 ? void 0 : onClick(e);
                    return [2 /*return*/];
            }
        });
    }); };
    if (asChild) {
        return (<radix_ui_1.Slot.Root onClick={handleClick} {...props}>
        {children}
      </radix_ui_1.Slot.Root>);
    }
    return (<button_1.Button onClick={handleClick} size="icon" variant="ghost" {...props}>
      {children !== null && children !== void 0 ? children : <lucide_react_1.CropIcon className="size-4"/>}
    </button_1.Button>);
};
exports.ImageCropApply = ImageCropApply;
var ImageCropReset = function (_a) {
    var _b = _a.asChild, asChild = _b === void 0 ? false : _b, children = _a.children, onClick = _a.onClick, props = __rest(_a, ["asChild", "children", "onClick"]);
    var resetCrop = useImageCrop().resetCrop;
    var handleClick = function (e) {
        resetCrop();
        onClick === null || onClick === void 0 ? void 0 : onClick(e);
    };
    if (asChild) {
        return (<radix_ui_1.Slot.Root onClick={handleClick} {...props}>
        {children}
      </radix_ui_1.Slot.Root>);
    }
    return (<button_1.Button onClick={handleClick} size="icon" variant="ghost" {...props}>
      {children !== null && children !== void 0 ? children : <lucide_react_1.RotateCcwIcon className="size-4"/>}
    </button_1.Button>);
};
exports.ImageCropReset = ImageCropReset;
var Cropper = function (_a) {
    var onChange = _a.onChange, onComplete = _a.onComplete, onCrop = _a.onCrop, style = _a.style, className = _a.className, file = _a.file, maxImageSize = _a.maxImageSize, props = __rest(_a, ["onChange", "onComplete", "onCrop", "style", "className", "file", "maxImageSize"]);
    return (<exports.ImageCrop file={file} maxImageSize={maxImageSize} onChange={onChange} onComplete={onComplete} onCrop={onCrop} {...props}>
    <exports.ImageCropContent className={className} style={style}/>
  </exports.ImageCrop>);
};
exports.Cropper = Cropper;
