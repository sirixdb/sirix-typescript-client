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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const utils_1 = require("./utils");
class Auth {
    constructor(loginInfo, sirixInfo, authData, callback) {
        this.loginInfo = loginInfo;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
        this.callback = callback;
        this._ready = null;
        this.authenticate().then(result => {
            if (result) {
                this._ready = true;
            }
            else {
                this._ready = false;
            }
        });
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._ready !== null) {
                return this._ready;
            }
            else {
                yield new Promise(r => setTimeout(r, 100));
                return this.ready();
            }
        });
    }
    authenticate() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.post(`${this.sirixInfo.sirixUri}/token`, qs_1.default.stringify({ username: this.loginInfo.username, password: this.loginInfo.password, grant_type: 'password' }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                utils_1.updateData(JSON.parse(res.data), this.authData);
                this.setRefreshTimeout();
                return true;
            }
        });
    }
    setRefreshTimeout() {
        this.timeout = setTimeout(() => this.refresh(), this.authData.expires_in - 5);
    }
    destroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.post(`${this.sirixInfo.sirixUri}/token`, qs_1.default.stringify({ refresh_token: this.authData.refresh_token, grant_type: 'refresh_token' }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            if (res.status >= 400) {
                console.error(res.status, res.data);
                yield this.callback();
                this.setRefreshTimeout();
            }
            else {
                let authData = JSON.parse(res.data);
                utils_1.updateData(authData, this.authData);
                this.setRefreshTimeout();
            }
        });
    }
}
exports.default = Auth;
