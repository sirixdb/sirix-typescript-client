"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function contentType(type) {
    if (type === 'json') {
        return 'application/json';
    }
    else {
        return 'application/xml';
    }
}
exports.contentType = contentType;
function updateData(updated, old) {
    for (let key in Object.keys(updated)) {
        old[key] = updated[key];
    }
}
exports.updateData = updateData;
var Insert;
(function (Insert) {
    Insert["CHILD"] = "asFirstChild";
    Insert["LEFT"] = "asLeftSibling";
    Insert["RIGHT"] = "asRightSibling";
    Insert["REPLACE"] = "replace";
})(Insert = exports.Insert || (exports.Insert = {}));