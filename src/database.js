var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Axios from 'axios';
import { contentType, updateData } from './utils';
export default class Database {
    constructor(name, type, sirixInfo, authData) {
        this.name = name;
        this.type = type;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
        let db = sirixInfo.databaseInfo.filter(obj => obj.name === name);
        if (db.length > 0) {
            this.type = db[0].type;
        }
        else {
            this.create();
        }
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield Axios.delete(`${this.sirixInfo.sirixUri}/${this.name}`, { headers: { Authorization: this.authData.access_token, 'Content-Type': contentType(this.type) } });
            if (res.status !== 204) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                this.getInfo();
                return true;
            }
        });
    }
    resource() {
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield Axios.get(`this.sirixInfo.sirixUri/${this.name}`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${this.authData.access_token}`
                }
            });
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return null;
            }
            let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === name)[0];
            updateData(db, JSON.parse(res.data));
            return db;
        });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield Axios.put(`${this.sirixInfo.sirixUri}/${this.name}`, {}, {
                headers: { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type) }
            });
            if (res.status === 201) {
                this.getInfo();
                return true;
            }
            else {
                console.error(res.status, res.data);
                return false;
            }
        });
    }
}
