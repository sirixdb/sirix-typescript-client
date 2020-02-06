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
const auth_1 = __importDefault(require("./auth"));
const database_1 = __importDefault(require("./database"));
class Sirix {
    constructor(username, password, sirixUri, callback) {
        this.sirixInfo = { sirixUri };
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
        return __awaiter(this, void 0, void 0, function* () {
            return new database_1.default(db_name, db_type, this.sirixInfo, this.authData);
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.get(this.sirixInfo.sirixUri, {
                params: { withResources: true },
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${this.authData.access_token}`
                }
            });
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return null;
            }
            this.sirixInfo.databaseInfo = JSON.parse(res.data);
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
