export function contentType(type) {
    if (type === 'json') {
        return 'application/json';
    }
    else {
        return 'application/xml';
    }
}
export function updateData(updated, old) {
    for (let key in Object.keys(updated)) {
        old[key] = updated[key];
    }
}
export var Insert;
(function (Insert) {
    Insert["CHILD"] = "asFirstChild";
    Insert["LEFT"] = "asLeftSibling";
    Insert["RIGHT"] = "asRightSibling";
    Insert["REPLACE"] = "replace";
})(Insert || (Insert = {}));
