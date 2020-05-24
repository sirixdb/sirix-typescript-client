"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var info_1 = require("./info");
var resource_1 = require("./resource");
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
        return new resource_1.default(this.name, name, this.dbType, this.contentType, this._client);
    };
    Database.prototype.getInfo = function () {
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
