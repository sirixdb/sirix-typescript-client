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
var constants_1 = require("./constants");
var Resource = (function () {
    function Resource(dbName, name, dbType, contentType, _client) {
        this.dbName = dbName;
        this.name = name;
        this.dbType = dbType;
        this.contentType = contentType;
        this._client = _client;
    }
    Resource.prototype.create = function (data) {
        return this._client.createResource(this.dbName, this.contentType, this.name, data);
    };
    Resource.prototype.exists = function () {
        return this._client.resourceExists(this.dbName, this.contentType, this.name);
    };
    Resource.prototype.read = function (inputParams) {
        var params = Resource._readParams(inputParams);
        return this._client.readResource(this.dbName, this.contentType, this.name, params)
            .then(function (res) {
            return res.data;
        });
    };
    Resource.prototype.readWithMetadata = function (inputParams) {
        var params = Resource._readParams(inputParams);
        params["withMetadata"] = true;
        return this._client.readResource(this.dbName, this.contentType, this.name, params)
            .then(function (res) {
            return res.data;
        });
    };
    Resource._readParams = function (inputParams) {
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
    Resource.prototype.history = function () {
        return this._client.history(this.dbName, this.contentType, this.name);
    };
    Resource.prototype.diff = function (firstRevision, secondRevision, inputParams) {
        var params = {};
        if (inputParams.nodeId) {
            params.startNodeKey = inputParams.nodeId;
        }
        if (inputParams.maxLevel) {
            params.maxDepth = inputParams.maxLevel;
        }
        if (typeof firstRevision === "number" && typeof secondRevision === "number") {
            params["first-revision"] = firstRevision;
            params["second-revision"] = secondRevision;
        }
        else if (firstRevision instanceof Date && secondRevision instanceof Date) {
            params["first-revision"] = firstRevision.toISOString();
            params["second-revision"] = secondRevision.toISOString();
        }
        return this._client.diff(this.dbName, this.name, params)
            .then(function (res) {
            return res.data;
        });
    };
    Resource.prototype.getEtag = function (nodeId) {
        return this._client.getEtag(this.dbName, this.contentType, this.name, { nodeId: nodeId })
            .then(function (res) {
            return res.headers.etag;
        });
    };
    Resource.prototype.update = function (updateParams) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (updateParams.insert === undefined) {
                            updateParams.insert = constants_1.Insert.CHILD;
                        }
                        if (!(updateParams.etag == undefined)) return [3, 2];
                        _a = updateParams;
                        return [4, this.getEtag(updateParams.nodeId)];
                    case 1:
                        _a.etag = _b.sent();
                        _b.label = 2;
                    case 2: return [2, this._client.update(this.dbName, this.contentType, this.name, updateParams)];
                }
            });
        });
    };
    Resource.prototype.delete = function (nodeId, ETag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!ETag && nodeId)) return [3, 2];
                        return [4, this.getEtag(nodeId)];
                    case 1:
                        ETag = _a.sent();
                        _a.label = 2;
                    case 2: return [2, this._client.resourceDelete(this.dbName, this.contentType, this.name, nodeId, ETag)];
                }
            });
        });
    };
    return Resource;
}());
exports.default = Resource;
