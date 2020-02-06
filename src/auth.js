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
const utils_1 = require("./utils");
class Auth {
    constructor(loginInfo, sirixInfo, authData, callback) {
        this.loginInfo = loginInfo;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
        this.callback = callback;
        this.authenticate().then(() => {
            this.setRefreshTimeout();
        });
    }
    authenticate() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.post(`${this.sirixInfo.sirixUri}/token`, { username: this.loginInfo.username, password: this.loginInfo.password, grant_type: 'password' }, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.status >= 400) {
                console.error(res.status, res.data);
            }
            else {
                utils_1.updateData(JSON.parse(res.data), this.authData);
            }
        });
    }
    setRefreshTimeout() {
        setTimeout(() => this.refresh(), this.authData.expires_in - 5);
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.post(`${this.sirixInfo.sirixUri}/token`, { refresh_token: this.authData.refresh_token, grant_type: 'refresh_token' }, { headers: { 'Content-Type': 'multipart/form-data' } });
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
