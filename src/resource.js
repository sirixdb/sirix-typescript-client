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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var axios_1 = require("axios");
var utils_1 = require("./utils");
var Resource = (function () {
    function Resource(dbName, resourceName, type, sirixInfo, authData) {
        this.dbName = dbName;
        this.resourceName = resourceName;
        this.type = type;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
        var db = sirixInfo.databaseInfo.filter(function (obj) { return obj.name === name; });
        if (db.length > 0) {
            this.type = db[0].type;
        }
    }
    Resource.prototype.create = function (data) {
        var _this = this;
        return axios_1.default.put(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName, data, {
            headers: {
                Authorization: "Bearer " + this.authData.access_token,
                'Content-Type': utils_1.contentType(this.type),
                'Accept': utils_1.contentType(this.type)
            }
        }).then(function (res) {
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                var db = _this.sirixInfo.databaseInfo.filter(function (obj) { return obj.name === _this.dbName; })[0];
                if (db.resources.indexOf(_this.resourceName) === -1) {
                    db.resources.push(_this.resourceName);
                }
                return true;
            }
        });
    };
    Resource.prototype.history = function () {
        return axios_1.default.get(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName + "/history", {
            headers: { Authorization: "Bearer " + this.authData.access_token }
        }).then(function (res) {
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return null;
            }
            else {
                return res.data["history"];
            }
        });
    };
    Resource.prototype.diff = function (firstRevision, secondRevision, inputParams) {
        var params = {};
        if (inputParams.nodeId) {
            params = __assign(__assign({}, params), { startNodeKey: inputParams.nodeId });
        }
        if (inputParams.maxLevel) {
            params = __assign(__assign({}, params), { maxDepth: inputParams.maxLevel });
        }
        if (typeof firstRevision === "number" && typeof secondRevision === "number") {
            params = __assign(__assign({}, params), { "first-revision": firstRevision, "second-revision": secondRevision });
        }
        else if (firstRevision instanceof Date && secondRevision instanceof Date) {
            params = __assign(__assign({}, params), { "first-revision": firstRevision.toISOString(), "second-revision": secondRevision.toISOString() });
        }
        return axios_1.default.get(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName + "/diff", {
            params: params,
            headers: { Authorization: "Bearer " + this.authData.access_token }
        }).then(function (res) {
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return null;
            }
            else {
                return res.data;
            }
        });
    };
    Resource.prototype.read = function (inputParams) {
        var params = this.readParams(inputParams);
        return axios_1.default.get(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName, {
            params: params,
            headers: { Authorization: "Bearer " + this.authData.access_token, 'Content-Type': utils_1.contentType(this.type) }
        }).then(function (res) {
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return null;
            }
            else {
                return res.data;
            }
        });
    };
    Resource.prototype.readWithMetadata = function (inputParams) {
        var params = this.readParams(inputParams);
        params["withMetadata"] = true;
        return axios_1.default.get(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName, {
            params: params,
            headers: { Authorization: "Bearer " + this.authData.access_token, 'Content-Type': utils_1.contentType(this.type) }
        }).then(function (res) {
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return null;
            }
            else {
                return res.data;
            }
        });
    };
    Resource.prototype.readParams = function (inputParams) {
        var _a = __assign({}, inputParams), nodeId = _a.nodeId, revision = _a.revision, maxLevel = _a.maxLevel;
        var params = {};
        if (nodeId) {
            params['nodeId'] = nodeId;
        }
        if (maxLevel) {
            params['maxLevel'] = maxLevel;
        }
        if (revision) {
            if (typeof revision === 'number') {
                params['revision'] = revision;
            }
            else if (revision instanceof Date) {
                params['revision-timestamp'] = revision.toISOString();
            }
            else if (typeof revision[0] === 'number' && typeof revision[1] === 'number') {
                params['start-revision'] = revision[0];
                params['end-revision'] = revision[1];
            }
            else if (revision[0] instanceof Date && revision[1] instanceof Date) {
                params['start-revision-timestamp'] = revision[0].toISOString();
                params['end-revision-timestamp'] = revision[1].toISOString();
            }
        }
        return params;
    };
    Resource.prototype.updateById = function (nodeId, data, insert) {
        return __awaiter(this, void 0, void 0, function () {
            var params, head, ETag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = { nodeId: nodeId };
                        return [4, axios_1.default.head(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName, {
                                params: params, headers: {
                                    Authorization: "Bearer " + this.authData.access_token, 'Content-Type': utils_1.contentType(this.type)
                                }
                            })];
                    case 1:
                        head = _a.sent();
                        if (head.status !== 200) {
                            console.error(head.status, head.data);
                            return [2, null];
                        }
                        ETag = head.headers['ETag'];
                        return [4, this.update(nodeId, ETag, data, insert)];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    Resource.prototype.update = function (nodeId, ETag, data, insert) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, axios_1.default.post(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName, data, {
                            params: { nodeId: nodeId, insert: insert },
                            headers: {
                                Authorization: "Bearer " + this.authData.access_token, 'Content-Type': utils_1.contentType(this.type)
                            }
                        })];
                    case 1:
                        res = _a.sent();
                        if (res.status !== 201) {
                            console.error(res.status, res.data);
                            return [2, false];
                        }
                        return [2, true];
                }
            });
        });
    };
    Resource.prototype.deleteById = function (nodeId) {
        return __awaiter(this, void 0, void 0, function () {
            var params, headers, head;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {};
                        if (nodeId !== null) {
                            params = { nodeId: nodeId };
                        }
                        headers = { Authorization: "Bearer " + this.authData.access_token, Accept: utils_1.contentType(this.type) };
                        return [4, axios_1.default.head(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName, { params: params, headers: headers })];
                    case 1:
                        head = _a.sent();
                        if (head.status !== 200) {
                            console.error(head.status, head.data);
                            return [2, false];
                        }
                        return [2, this.delete(nodeId, head.headers['ETag'])];
                }
            });
        });
    };
    Resource.prototype.delete = function (nodeId, ETag) {
        return __awaiter(this, void 0, void 0, function () {
            var params, headers, res, db;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {};
                        headers = {};
                        if (nodeId != null) {
                            params = { nodeId: nodeId };
                            headers = { Authorization: "Bearer " + this.authData.access_token, ETag: ETag };
                        }
                        else {
                            headers = { Authorization: "Bearer " + this.authData.access_token };
                        }
                        return [4, axios_1.default.delete(this.sirixInfo.sirixUri + "/" + this.dbName + "/" + this.resourceName, { params: params, headers: headers })];
                    case 1:
                        res = _a.sent();
                        if (res.status !== 204) {
                            console.error(res.status, res.data);
                            return [2, false];
                        }
                        else {
                            if (nodeId === null) {
                                db = this.sirixInfo.databaseInfo.filter(function (obj) { return obj.name === _this.dbName; })[0];
                                db.resources.splice(db.resources.findIndex(function (val) { return val === _this.resourceName; }));
                            }
                            return [2, true];
                        }
                        return [2];
                }
            });
        });
    };
    return Resource;
}());
exports.default = Resource;
