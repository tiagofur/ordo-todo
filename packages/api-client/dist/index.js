"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.MemoryTokenStorage = exports.LocalStorageTokenStorage = exports.OrdoApiClient = void 0;
// Main exports
var client_1 = require("./client");
Object.defineProperty(exports, "OrdoApiClient", { enumerable: true, get: function () { return client_1.OrdoApiClient; } });
// Storage utilities
var storage_1 = require("./utils/storage");
Object.defineProperty(exports, "LocalStorageTokenStorage", { enumerable: true, get: function () { return storage_1.LocalStorageTokenStorage; } });
Object.defineProperty(exports, "MemoryTokenStorage", { enumerable: true, get: function () { return storage_1.MemoryTokenStorage; } });
// Types
__exportStar(require("./types"), exports);
// Pre-configured instance
var api_instance_1 = require("./api-instance");
Object.defineProperty(exports, "apiClient", { enumerable: true, get: function () { return api_instance_1.apiClient; } });
