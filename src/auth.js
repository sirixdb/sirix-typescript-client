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
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class Auth {
    constructor(loginInfo, sirixInfo, authData, callback) {
        this.loginInfo = loginInfo;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
        this.callback = callback;
    }
    authenticate() {
        return axios_1.default.post(`${this.sirixInfo.sirixUri}/token`, { username: this.loginInfo.username, password: this.loginInfo.password, grant_type: 'password' })
            .then(res => {
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                Object.assign(this.authData, res.data);
                this.setRefreshTimeout();
                return true;
            }
        });
    }
    setRefreshTimeout() {
        this.timeout = setTimeout(() => this.refresh(), (this.authData.expires_in - 5) * 1000);
    }
    destroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.post(`${this.sirixInfo.sirixUri}/token`, { refresh_token: this.authData.refresh_token, grant_type: 'refresh_token' });
            if (res.status >= 400) {
                console.error(res.status, res.data);
                yield this.callback();
                this.setRefreshTimeout();
            }
            else {
                Object.assign(this.authData, res.data);
                this.setRefreshTimeout();
            }
        });
    }
}
exports.default = Auth;
