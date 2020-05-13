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
var Client = (function () {
    function Client() {
    }
    Client.prototype.init = function (loginInfo, sirixUri) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                initClient(loginInfo, sirixUri)
                    .then(function (client) {
                    _this._client = client;
                });
                return [2];
            });
        });
    };
    return Client;
}());
exports.default = Client;
function initClient(loginInfo, sirixUri) {
    function refreshTokenWithCredentials() {
        return axios_1.default.post(sirixUri + "/token", loginInfo)
            .then(function (res) {
            if (res.status === 200) {
                return res.data;
            }
            else {
                console.error(res.status, res.data);
                console.error("failed to retrieve an access token. aborting");
                return undefined;
            }
        });
    }
    return axios_1.default.post(sirixUri + "/token", loginInfo)
        .then(function (res) {
        var authData = res.data;
        setTimeout(function () {
            refreshClient(authData, sirixUri)
                .then(function (newAuthData) {
                if (newAuthData !== undefined) {
                    authData = newAuthData;
                }
                else {
                    console.debug("token refresh failed. retrying");
                    refreshTokenWithCredentials()
                        .then(function (newAuthData) {
                        authData = newAuthData;
                    });
                }
            });
        }, (authData.expires_in - 10) * 1000);
        return function request(config) {
            config.headers = __assign(__assign({}, config.headers), { authorization: authData.access_token });
            return axios_1.default(config);
        };
    });
}
function refreshClient(authData, sirixUri) {
    return axios_1.default.post(sirixUri + "/token", { refresh_token: authData.refresh_token, grant_type: 'refresh_token' })
        .then(function (res) {
        if (res.status !== 200) {
            console.error(res.status, res.data);
            return undefined;
        }
        return res.data;
    });
}
