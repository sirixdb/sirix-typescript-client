"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var info_1 = require("./info");
var Database = (function () {
    function Database(name, dbType, _client) {
        this.name = name;
        this.dbType = dbType;
        this._client = _client;
        if (dbType === info_1.DBType.JSON) {
            this.contentType = info_1.ContentType.JSON;
        }
        else {
            this.contentType = info_1.ContentType.XML;
        }
    }
    Database.prototype.create = function () {
        return this._client.createDatabase(this.name, this.contentType);
    };
    Database.prototype.resource = function (name) {
        return null;
    };
    Database.prototype.getInfo = function (withResources) {
        if (withResources === void 0) { withResources = false; }
        var params = { withResources: withResources };
        if (!withResources) {
            delete params.withResources;
        }
        return this._client.getDatabaseInfo(this.name)
            .then(function (res) {
            return res.data;
        });
    };
    Database.prototype.delete = function () {
        return this._client.deleteDatabase(this.name);
    };
    return Database;
}());
exports.default = Database;
