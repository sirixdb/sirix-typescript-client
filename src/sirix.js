"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("./client");
var database_1 = require("./database");
function sirixInit(loginInfo, sirixUri) {
    var sirix = new Sirix();
    return sirix.init(loginInfo, sirixUri)
        .then(function () {
        return sirix;
    });
}
var Sirix = (function () {
    function Sirix() {
        this._client = new client_1.default();
    }
    Sirix.prototype.init = function (loginInfo, sirixUri) {
        return this._client.init(loginInfo, sirixUri);
    };
    Sirix.prototype.database = function (dbName, dbType) {
        return new database_1.default(dbName, dbType, this._client);
    };
    Sirix.prototype.getInfo = function (resources) {
        return this._client.globalInfo(resources)
            .then(function (res) {
            return res.data.databases;
        });
    };
    Sirix.prototype.query = function (query, startResultSeqIndex, endResultSeqIndex) {
        var queryObj = { query: query, startResultSeqIndex: startResultSeqIndex, endResultSeqIndex: endResultSeqIndex };
        Object.keys(queryObj).forEach(function (param) {
            if (param === undefined) {
                delete queryObj[param];
            }
        });
        return this._client.postQuery(queryObj);
    };
    Sirix.prototype.deleteAll = function () {
        return this._client.deleteAll()
            .then(function () {
            return true;
        })
            .catch(function () {
            return false;
        });
    };
    return Sirix;
}());
exports.default = Sirix;
