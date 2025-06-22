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
var path = require("path");
var fs = require("fs");
var factionMap_1 = require("./src/lib/data/factionMap");
function slugify(text) {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}
// Manually defined mapping from slugified class names to GIF shorthand names
var CLASS_SLUG_TO_GIF_SHORT_NAME_MAP = {
    "priest": "priest",
    "seeker": "seeker",
    "paladin": "pala",
    "mage": "mage",
    "templar": "temp",
    "druid": "druid",
    "blade-dancer": "bd",
    "warden": "warden",
    "ranger": "ranger",
    "beast-master": "bm",
    "barbarian": "barb",
    "rogue": "rogue",
    "hunter": "hunter",
    "chieftain": "chief",
    "shaman": "shaman",
    "death-knight": "dk",
    "necromancer": "necro",
    "warlock": "warlock",
    "charmer": "charm",
    "reaper": "reap",
};
function copyGifAssets() {
    return __awaiter(this, void 0, void 0, function () {
        var gifBaseDir, classImageBaseDir, _i, _a, className, slugifiedClassName, gifShortName, sourceGifPath, destinationClassPath, files, _b, files_1, file, sourceFilePath, destinationFilePath;
        return __generator(this, function (_c) {
            gifBaseDir = path.join(process.cwd(), 'public', 'gif');
            classImageBaseDir = path.join(process.cwd(), 'public', 'image', 'classes');
            for (_i = 0, _a = Object.keys(factionMap_1.CLASS_FACTION_INFO_MAP); _i < _a.length; _i++) {
                className = _a[_i];
                slugifiedClassName = slugify(className);
                gifShortName = CLASS_SLUG_TO_GIF_SHORT_NAME_MAP[slugifiedClassName];
                if (!gifShortName) {
                    console.warn("No GIF shorthand mapping found for class: ".concat(className, " (slug: ").concat(slugifiedClassName, "). Skipping."));
                    continue;
                }
                sourceGifPath = path.join(gifBaseDir, gifShortName);
                destinationClassPath = path.join(classImageBaseDir, slugifiedClassName);
                if (!fs.existsSync(sourceGifPath)) {
                    console.warn("Source GIF folder not found for ".concat(className, " at: ").concat(sourceGifPath, ". Skipping."));
                    continue;
                }
                if (!fs.existsSync(destinationClassPath)) {
                    console.warn("Destination class folder not found for ".concat(className, " at: ").concat(destinationClassPath, ". This should not happen if create_class_folders.ts ran successfully. Skipping."));
                    continue;
                }
                try {
                    files = fs.readdirSync(sourceGifPath);
                    if (files.length === 0) {
                        console.log("No GIF files found in ".concat(sourceGifPath, ". Skipping copy for ").concat(className, "."));
                        continue;
                    }
                    console.log("Copying GIFs for ".concat(className, " from ").concat(sourceGifPath, " to ").concat(destinationClassPath));
                    for (_b = 0, files_1 = files; _b < files_1.length; _b++) {
                        file = files_1[_b];
                        sourceFilePath = path.join(sourceGifPath, file);
                        destinationFilePath = path.join(destinationClassPath, file);
                        fs.copyFileSync(sourceFilePath, destinationFilePath);
                        console.log("  Copied: ".concat(file));
                    }
                    console.log("Finished copying for ".concat(className, "."));
                }
                catch (error) {
                    console.error("Error copying GIFs for ".concat(className, ":"), error);
                }
            }
            console.log('All GIF assets processing complete.');
            return [2 /*return*/];
        });
    });
}
copyGifAssets();
