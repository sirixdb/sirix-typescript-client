"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("./src/client");
var auth_1 = require("./src/auth");
var utils_1 = require("./src/utils");
exports.default = { Sirix: client_1.default, Auth: auth_1.default, Insert: utils_1.Insert };
