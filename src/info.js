"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeType = exports.ContentType = exports.DBType = void 0;
var DBType;
(function (DBType) {
    DBType["JSON"] = "JSON";
    DBType["XML"] = "XML";
})(DBType || (DBType = {}));
exports.DBType = DBType;
var ContentType;
(function (ContentType) {
    ContentType["JSON"] = "application/json";
    ContentType["XML"] = "application/xml";
})(ContentType || (ContentType = {}));
exports.ContentType = ContentType;
var NodeType;
(function (NodeType) {
    NodeType["OBJECT"] = "OBJECT";
    NodeType["ARRAY"] = "ARRAY";
    NodeType["OBJECT_KEY"] = "OBJECT_KEY";
    NodeType["OBJECT_STRING_VALUE"] = "OBJECT_STRING_VALUE";
    NodeType["STRING_VALUE"] = "STRING_VALUE";
    NodeType["OBJECT_NUMBER_VALUE"] = "OBJECT_NUMBER_VALUE";
    NodeType["NUMBER_VALUE"] = "NUMBER_VALUE";
    NodeType["OBJECT_BOOLEAN_VALUE"] = "OBJECT_BOOLEAN_VALUE";
    NodeType["BOOLEAN_VALUE"] = "BOOLEAN_VALUE";
    NodeType["OBJECT_NULL_VALUE"] = "OBJECT_NULL_VALUE";
    NodeType["NULL_VALUE"] = "NULL_VALUE";
})(NodeType || (NodeType = {}));
exports.NodeType = NodeType;
