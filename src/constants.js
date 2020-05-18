"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insert = exports.contentType = void 0;
var info_1 = require("./info");
function contentType(dbType) {
    if (dbType === info_1.DBType.JSON) {
        return info_1.ContentType.JSON;
    }
    return info_1.ContentType.XML;
}
exports.contentType = contentType;
var Insert;
(function (Insert) {
    Insert["CHILD"] = "asFirstChild";
    Insert["LEFT"] = "asLeftSibling";
    Insert["RIGHT"] = "asRightSibling";
    Insert["REPLACE"] = "replace";
})(Insert = exports.Insert || (exports.Insert = {}));
