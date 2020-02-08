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
const auth_1 = require("./auth");
const database_1 = require("./database");
class Sirix {
    constructor(username, password, sirixUri, callback) {
        this.sirixInfo = { sirixUri, databaseInfo: [] };
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
        this.auth = new auth_1.default({ username, password, clientId: 'sirix' }, this.sirixInfo, this.authData, callback);
    }
    database(db_name, db_type = null) {
        const db = new database_1.default(db_name, db_type, this.sirixInfo, this.authData);
        return db.ready().then(res => {
            if (res) {
                return db;
            }
            return null;
        });
    }
    getInfo() {
        return axios_1.default.get(this.sirixInfo.sirixUri, {
            params: { withResources: true },
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.authData.access_token}`
            }
        }).then(res => {
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return null;
            }
            this.sirixInfo.databaseInfo.splice(0, this.sirixInfo.databaseInfo.length, ...res.data);
            return this.sirixInfo.databaseInfo;
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.delete(this.sirixInfo.sirixUri, { headers: { Authorization: this.authData.access_token } });
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return false;
            }
            yield this.getInfo();
            return true;
        });
    }
}
exports.default = Sirix;
