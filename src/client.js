"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth_1 = require("./auth");
var info_1 = require("./info");
var Client = (function () {
    function Client() {
    }
    Client.prototype.init = function (loginInfo, sirixUri) {
        var _this = this;
        return auth_1.initClient(loginInfo, sirixUri)
            .then(function (_a) {
            var request = _a.request, shutdown = _a.shutdown;
            _this._request = request;
            _this.shutdown = shutdown;
        });
    };
    Client.prototype.globalInfo = function (resources) {
        if (resources === void 0) { resources = true; }
        var params = {};
        if (resources) {
            params = { "withResources": true };
        }
        return this._request({ method: "GET", url: "/", params: params });
    };
    Client.prototype.deleteAll = function () {
        return this._request({ method: "DELETE", url: "/" });
    };
    Client.prototype.createDatabase = function (name, contentType) {
        return this._request({
            url: "/" + name,
            method: "PUT",
            headers: { "content-type": contentType }
        });
    };
    Client.prototype.getDatabaseInfo = function (name) {
        return this._request({
            method: "GET",
            url: "/" + name,
            headers: { "accept": info_1.ContentType.JSON }
        });
    };
    Client.prototype.deleteDatabase = function (name) {
        return this._request({ method: "DELETE", url: "/" + name });
    };
    Client.prototype.resourceExists = function (dbName, contentType, resource) {
        return this._request({
            method: "HEAD",
            url: "/" + dbName + "/" + resource,
            headers: { "accept": info_1.ContentType }
        })
            .then(function () {
            return true;
        })
            .catch(function (err) {
            if (err.response.status === 404) {
                return false;
            }
            else {
                console.log(err);
                throw Error(err);
            }
        });
    };
    Client.prototype.createResource = function (dbName, contentType, resource, data) {
        return this._request({
            method: "PUT",
            url: "/" + dbName + "/" + resource,
            headers: { "content-type": contentType },
            data: data
        });
    };
    Client.prototype.readResource = function (dbName, contentType, resource, params) {
        return this._request({
            method: "GET",
            url: "/" + dbName + "/" + resource,
            params: params
        });
    };
    Client.prototype.history = function (dbName, contentType, resource) {
        return this._request({
            method: "GET",
            url: "/" + dbName + "/" + resource + "/history",
            headers: { "accept": contentType }
        })
            .then(function (res) {
            return res.data.history;
        });
    };
    Client.prototype.diff = function (dbName, resource, params) {
        return this._request({
            method: "GET",
            url: "/" + dbName + "/" + resource + "/diff",
            params: params
        });
    };
    Client.prototype.postQuery = function (query) {
        return this._request({ url: '/', method: "POST", data: query });
    };
    Client.prototype.getEtag = function (dbName, contentType, resource, params) {
        return this._request({
            method: "HEAD",
            url: "/" + dbName + "/" + resource,
            params: params,
            headers: { "accept": contentType }
        });
    };
    Client.prototype.update = function (dbName, contentType, resource, updateParams) {
        return this._request({
            method: "POST",
            url: "/" + dbName + "/" + resource,
            params: { nodeId: updateParams.nodeId, insert: updateParams.insert },
            headers: { ETag: updateParams.etag, "content-type": contentType },
            data: updateParams.data
        });
    };
    Client.prototype.resourceDelete = function (dbName, contentType, resource, nodeId, ETag) {
        if (nodeId) {
            return this._request({
                url: "/" + dbName + "/" + resource,
                method: "DELETE",
                params: { nodeId: nodeId },
                headers: { ETag: ETag, "content-type": contentType }
            });
        }
        else {
            return this._request({
                url: "/" + dbName + "/" + resource,
                method: "DELETE",
            });
        }
    };
    return Client;
}());
exports.default = Client;
