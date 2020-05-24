"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sirix_1 = require("./src/sirix");
var database_1 = require("./src/database");
var resource_1 = require("./src/resource");
var constants_1 = require("./src/constants");
exports.default = { Sirix: sirix_1.Sirix, Database: database_1.default, Resource: resource_1.default, sirixInit: sirix_1.sirixInit, Insert: constants_1.Insert };
