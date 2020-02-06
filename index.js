"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./src/client"));
const auth_1 = __importDefault(require("./src/auth"));
exports.default = { Sirix: client_1.default, Auth: auth_1.default };
