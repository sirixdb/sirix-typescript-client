"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var utils_1 = require("./utils");
var resource_1 = require("./resource");
var Database = (function () {
    function Database(name, type, sirixInfo, authData) {
        this.name = name;
        this.type = type;
        this.sirixInfo = sirixInfo;
        this.authData = authData;
    }
    Database.prototype.ready = function () {
        var _this = this;
        var db = this.sirixInfo.databaseInfo.filter(function (obj) { return obj.name === _this.name; });
        if (db.length > 0) {
            this.type = db[0].type;
            return Promise.resolve(true);
        }
        else {
            return this.create();
        }
    };
    Database.prototype.delete = function () {
        var _this = this;
        return axios_1.default.delete(this.sirixInfo.sirixUri + "/" + this.name, { headers: { Authorization: "Bearer " + this.authData.access_token, 'Content-Type': utils_1.contentType(this.type) } })
            .then(function (res) {
            if (res.status !== 204) {
                console.error(res.status, res.data);
                return false;
            }
            else {
                _this.sirixInfo.databaseInfo = _this.sirixInfo.databaseInfo.filter(function (db) {
                    return db.name !== _this.name;
                });
                return true;
            }
        });
    };
    Database.prototype.resource = function (name) {
        return new resource_1.default(this.name, name, this.type, this.sirixInfo, this.authData);
    };
    Database.prototype.getInfo = function (withResources) {
        var _this = this;
        if (withResources === void 0) { withResources = false; }
        var params = {};
        if (withResources) {
            params = { withResources: withResources };
        }
        return axios_1.default.get(this.sirixInfo.sirixUri, {
            headers: {
                Accept: 'application/json',
                Authorization: "Bearer " + this.authData.access_token
            }
        }).then(function (res) {
            if (res.status >= 400) {
                console.error(res.status, res.data);
                return null;
            }
            if (withResources) {
                Object.assign(_this.sirixInfo.databaseInfo, res.data["databases"]);
            }
            else {
                var db = _this.sirixInfo.databaseInfo.find(function (obj) { return obj.name === _this.name; });
                db = Object.assign(db, res.data["resources"]);
            }
            return _this.sirixInfo.databaseInfo;
        });
    };
    Database.prototype.create = function () {
        var _this = this;
        return axios_1.default.put(this.sirixInfo.sirixUri + "/" + this.name, {}, {
            headers: { Authorization: "Bearer " + this.authData.access_token, 'Content-Type': utils_1.contentType(this.type) }
        })
            .then(function (res) {
            if (res.status === 201) {
                return _this.getInfo(true).then(function () {
                    return true;
                });
            }
            else {
                console.error(res.status, res.data);
                return false;
            }
        });
    };
    return Database;
}());
exports.default = Database;
