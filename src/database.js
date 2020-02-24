"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const utils_1 = require("./utils");
const resource_1 = require("./resource");
class Database {
    constructor(name, type, sirixInfo, authData) {
        this.name = name;
        this.type = type;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
    }
    ready() {
        let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === this.name);
        if (db.length > 0) {
            this.type = db[0].type;
            return Promise.resolve(true);
        }
        else {
            return this.create();
        }
    }
    delete() {
        return axios_1.default.delete(`${this.sirixInfo.sirixUri}/${this.name}`, { headers: { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': utils_1.contentType(this.type) } })
            .then(res => {
            if (res.status !== 204) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                this.sirixInfo.databaseInfo = this.sirixInfo.databaseInfo.filter(db => {
                    return db.name === this.name;
                });
                return true;
            }
        });
    }
    resource(name) {
        return new resource_1.default(this.name, name, this.type, this.sirixInfo, this.authData);
    }
    getInfo(withResources = false) {
        let params = {};
        if (withResources) {
            params = { withResources };
        }
        return axios_1.default.get(this.sirixInfo.sirixUri, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.authData.access_token}`
            }
        }).then(res => {
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return null;
            }
            if (withResources) {
                Object.assign(this.sirixInfo.databaseInfo, res.data["databases"]);
            }
            else {
                let db = this.sirixInfo.databaseInfo.find(obj => obj.name === this.name);
                db = Object.assign(db, res.data["resources"]);
            }
            return this.sirixInfo.databaseInfo;
        });
    }
    create() {
        return axios_1.default.put(`${this.sirixInfo.sirixUri}/${this.name}`, {}, {
            headers: { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': utils_1.contentType(this.type) }
        })
            .then(res => {
            if (res.status === 201) {
                return this.getInfo(true).then(() => {
                    return true;
                });
            }
            else {
                console.error(res.status, res.data);
                return false;
            }
        });
    }
}
exports.default = Database;
