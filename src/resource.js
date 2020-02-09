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
class Resource {
    constructor(dbName, resourceName, type, sirixInfo, authData) {
        this.dbName = dbName;
        this.resourceName = resourceName;
        this.type = type;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
        this.exists = false;
        let db = sirixInfo.databaseInfo.filter(obj => obj.name === name);
        if (db.length > 0) {
            this.type = db[0].type;
            if (name in db[0].resources) {
                this.exists = true;
            }
        }
    }
    create(data) {
        return axios_1.default.put(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`, data, {
            headers: {
                Authorization: this.authData.access_token,
                'Content-Type': utils_1.contentType(this.type),
                'Accept': utils_1.contentType(this.type)
            }
        }).then(res => {
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === name)[0];
                db.resources.push(this.resourceName);
                return true;
            }
        });
    }
    read(nodeId, revision, maxLevel = null, withMetadata = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.exists) {
                let created = yield this.create("");
                if (!created) {
                    return null;
                }
            }
            let params = {};
            if (nodeId) {
                params['nodeId'] = nodeId;
            }
            if (maxLevel) {
                params['maxLevel'] = maxLevel;
            }
            if (withMetadata) {
                params['withMetadata'] = true;
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
            let res = yield axios_1.default.get(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`, {
                params: params,
                headers: { Authorization: this.authData.access_token, 'Content-Type': utils_1.contentType(this.type) }
            });
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return null;
            }
            else {
                return res.data;
            }
        });
    }
    updateById(nodeId, data, insert) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = { nodeId };
            let head = yield axios_1.default.head(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`, {
                params, headers: {
                    Authorization: this.authData.access_token, 'Content-Type': utils_1.contentType(this.type)
                }
            });
            if (head.status !== 200) {
                console.log(head.status, head.data);
                return null;
            }
            let ETag = head.headers['ETag'];
            return yield this.update(nodeId, ETag, data, insert);
        });
    }
    update(nodeId, ETag, data, insert) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios_1.default.post(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`, data, {
                params: { nodeId, insert },
                headers: {
                    Authorization: this.authData.access_token, 'Content-Type': utils_1.contentType(this.type)
                }
            });
            if (res.status !== 201) {
                console.error(res.status, res.data);
                return false;
            }
            return true;
        });
    }
    delete(nodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = {};
            if (nodeId !== null) {
                params = { nodeId };
            }
            let res = yield axios_1.default.delete(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`, { params, headers: { Authorization: this.authData.access_token } });
            if (res.status !== 204) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === name)[0];
                db.resources.splice(db.resources.findIndex(val => this.resourceName));
                return true;
            }
        });
    }
}
exports.default = Resource;
