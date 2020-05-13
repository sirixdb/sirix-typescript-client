"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var auth_1 = require("./auth");
var database_1 = require("./database");
var Sirix = (function () {
    function Sirix() {
        this.authData = {
            access_token: null,
            expires_in: null,
            refresh_expires_in: null,
            refresh_token: null,
            token_type: null,
            not_before_policy: null,
            session_state: null,
            scope: null
        };
    }
    Sirix.prototype.authenticate = function (username, password, sirixUri, callback) {
        this.sirixInfo = { sirixUri: sirixUri, databaseInfo: [] };
        this.auth = new auth_1.default({ username: username, password: password, clientId: 'sirix' }, this.sirixInfo, this.authData, callback);
    };
    Sirix.prototype.database = function (db_name, db_type) {
        if (db_type === void 0) { db_type = null; }
        var db = new database_1.default(db_name, db_type, this.sirixInfo, this.authData);
        return db.ready().then(function (res) {
            if (res) {
                return db;
            }
            return null;
        });
    };
    Sirix.prototype.getInfo = function () {
        var _this = this;
        return axios_1.default.get(this.sirixInfo.sirixUri, {
            params: { withResources: true },
            headers: {
                Accept: 'application/json',
                Authorization: "Bearer " + this.authData.access_token
            }
        }).then(function (res) {
            var _a;
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return null;
            }
            (_a = _this.sirixInfo.databaseInfo).splice.apply(_a, __spreadArrays([0, _this.sirixInfo.databaseInfo.length], res.data["databases"]));
            return _this.sirixInfo.databaseInfo;
        });
    };
    Sirix.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, axios_1.default.delete(this.sirixInfo.sirixUri, { headers: { Authorization: "Bearer " + this.authData.access_token } })];
                    case 1:
                        res = _a.sent();
                        if (res.status >= 400) {
                            console.error(res.status, res.data);
                            return [2, false];
                        }
                        return [4, this.getInfo()];
                    case 2:
                        _a.sent();
                        return [2, true];
                }
            });
        });
    };
    Sirix.prototype.query = function (query, startResultSeqIndex, endResultSeqIndex) {
        if (startResultSeqIndex === void 0) { startResultSeqIndex = undefined; }
        if (endResultSeqIndex === void 0) { endResultSeqIndex = undefined; }
        var queryObj = { query: query, startResultSeqIndex: startResultSeqIndex, endResultSeqIndex: endResultSeqIndex };
        if (startResultSeqIndex === undefined) {
            delete queryObj.startResultSeqIndex;
        }
        if (endResultSeqIndex) {
            delete queryObj.endResultSeqIndex;
        }
        return axios_1.default.post(this.sirixInfo.sirixUri, queryObj, { headers: { Authorization: "Bearer " + this.authData.access_token } })
            .then(function (res) {
            if (res.status != 200) {
                console.error(res.status, res.data);
                return false;
            }
            return res.data;
        });
    };
    return Sirix;
}());
exports.default = Sirix;
